<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Blotter;
use App\Models\PreloadedResident;
use App\Models\User;

class LocalIdentifier
{
    public const RES = 'RES';
    public const PER = 'PER';
    public const ADM = 'ADM';
    public const BLT = 'BLT';

    public static function prefix(?Barangay $barangay = null): string
    {
        $barangay ??= Barangay::query()->first();
        $code = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', (string) ($barangay?->code ?? '')));

        if ($code === '' || $code === 'DEMOBARANGAY') {
            $name = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', (string) ($barangay?->name ?? '')));
            if ($name === '' || str_contains($name, 'TAMBO') || str_contains($name, 'DEMO')) {
                return 'TAMBO';
            }

            return substr($name, 0, 12);
        }

        return substr($code, 0, 12);
    }

    public static function format(?Barangay $barangay, string $type, int $number, int $width = 4): string
    {
        return self::prefix($barangay).'_'.self::normalizeType($type).'_'.str_pad((string) max(0, $number), $width, '0', STR_PAD_LEFT);
    }

    public static function normalizeType(string $type): string
    {
        return match (strtoupper(trim($type))) {
            'ADMIN', 'ADM' => self::ADM,
            'PERSONNEL', 'PER' => self::PER,
            'RESIDENT', 'RES' => self::RES,
            'BLOTTER', 'BLT', 'BL' => self::BLT,
            default => strtoupper(trim($type)),
        };
    }

    public static function isFormatted(string $id): bool
    {
        return (bool) preg_match('/^[A-Z0-9]+_(RES|PER|ADM|BLT)_\d+$/', strtoupper(trim($id)));
    }

    public static function typeOf(string $id): ?string
    {
        $id = strtoupper(trim($id));

        if (preg_match('/^[A-Z0-9]+_(RES|PER|ADM|BLT)_\d+$/', $id, $match)) {
            return $match[1];
        }

        if (preg_match('/^BL-\d{4}-\d+$/', $id)) {
            return self::BLT;
        }

        if (preg_match('/^(RES|PER|ADM|ADMIN|BLT|BL)[-_]?\d+$/', $id, $match)) {
            return self::normalizeType($match[1]);
        }

        return null;
    }

    public static function numberFrom(string $id): ?int
    {
        $id = strtoupper(trim($id));

        if (preg_match('/^BL-\d{4}-(\d+)$/', $id, $match)) {
            return (int) $match[1];
        }

        if (self::isFormatted($id) && preg_match('/_(\d+)$/', $id, $match)) {
            return (int) $match[1];
        }

        if (preg_match('/^(?:RES|PER|ADM|ADMIN|BLT|BL)[-_]?(\d+)$/', $id, $match)) {
            return (int) $match[1];
        }

        return null;
    }

    public static function normalize(string $id, ?Barangay $barangay = null): string
    {
        $id = strtoupper(trim($id));
        if ($id === '' || self::isFormatted($id)) {
            return $id;
        }

        $type = self::typeOf($id);
        $number = self::numberFrom($id);
        if ($type && $number !== null) {
            return self::format($barangay, $type, $number);
        }

        return $id;
    }

    public static function next(?Barangay $barangay, string $type): string
    {
        $type = self::normalizeType($type);
        $max = 0;

        $scan = function (iterable $ids) use (&$max, $type) {
            foreach ($ids as $id) {
                if (! is_string($id) || $id === '') {
                    continue;
                }
                if (self::typeOf($id) !== $type) {
                    continue;
                }
                $number = self::numberFrom($id);
                if ($number !== null) {
                    $max = max($max, $number);
                }
            }
        };

        if ($type === self::BLT) {
            $scan(Blotter::query()->where('barangay_id', $barangay?->id)->pluck('ticket_number'));
        } else {
            $role = match ($type) {
                self::RES => 'resident',
                self::PER => 'personnel',
                self::ADM => 'admin',
                default => null,
            };

            $query = User::query()->where('barangay_id', $barangay?->id);
            if ($role) {
                $query->where('role', $role);
            }
            $scan($query->pluck('account_id'));

            if ($type === self::RES) {
                $scan(PreloadedResident::query()->pluck('account_id'));
            }
        }

        return self::format($barangay, $type, $max + 1);
    }

    public static function resolveAccountId(string $input): string
    {
        $raw = strtoupper(trim($input));
        $normalized = self::normalize($raw);

        $match = User::query()
            ->where(function ($query) use ($raw, $normalized) {
                $query->where('account_id', $raw);
                if ($normalized !== $raw) {
                    $query->orWhere('account_id', $normalized);
                }
            })
            ->first();

        return $match?->account_id ?? $normalized;
    }

    public static function isResidentAccount(string $id): bool
    {
        return self::typeOf($id) === self::RES;
    }
}
