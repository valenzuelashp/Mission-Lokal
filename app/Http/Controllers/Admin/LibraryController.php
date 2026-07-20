<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LibraryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    /**
     * Display your multi-tenant directory stack.
     */
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        $items = LibraryItem::where('barangay_id', $barangayId)
            ->orderBy('sort_order', 'asc')
            ->latest()
            ->get()
            ->map(function ($item) {
                $meta = is_array($item->metadata) ? $item->metadata : json_decode($item->metadata ?? '{}', true);

                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'type' => $item->type, 
                    'content' => $item->content ?? '',
                    'subtitle' => $meta['subtitle'] ?? '',
                    'role' => $meta['role'] ?? '',
                    'phone' => $meta['phone'] ?? '',
                    'address' => $meta['address'] ?? '',
                ];
            });

        return Inertia::render('Admin/Library/Index', [
            'items' => $items,
        ]);
    }

    /**
     * Store manual entries and direct hotspot lines into library item structures.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:manual,contact,emergency,evacuation_center'],
            'content' => ['required_if:type,manual', 'nullable', 'string'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $barangayId = $request->user()->barangay_id;

        $metadata = [];
        if ($request->type === 'manual') {
            $metadata['subtitle'] = $request->subtitle ?? 'Emergency Guide';
            $metadata['icon'] = 'flood';
        } elseif ($request->type === 'evacuation_center') {
            $metadata['address'] = $request->address ?? 'Barangay Covered Court';
            $metadata['icon'] = 'office';
        } else {
            $metadata['role'] = $request->role ?? 'Barangay Staff';
            $metadata['phone'] = $request->phone ?? 'N/A';
            $metadata['icon'] = $request->type === 'emergency' ? 'fire' : 'office';
        }

        $nextOrder = LibraryItem::where('barangay_id', $barangayId)->count() + 1;

        LibraryItem::create([
            'barangay_id' => $barangayId,
            'title' => $request->title,
            'type' => $request->type,
            'content' => $request->content,
            'metadata' => $metadata,
            'is_active' => 1,
            'sort_order' => $nextOrder,
        ]);

        return back()->with('success', 'Resource item added to the official database registry.');
    }

    /**
     * Purge a specific resource item row.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $item = LibraryItem::where('barangay_id', $request->user()->barangay_id)->findOrFail($id);
        $item->delete();

        return back()->with('success', 'Library item completely removed.');
    }
}