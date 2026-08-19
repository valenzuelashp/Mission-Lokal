<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LibraryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
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
        $item = LibraryItem::create([
            'barangay_id' => $barangayId,
            'title' => $request->title,
            'type' => $request->type,
            'content' => $request->content,
            'metadata' => $metadata,
            'is_active' => 1,
            'sort_order' => $nextOrder,
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'CREATE',
            'entity_type' => 'LibraryItem',
            'entity_id' => $item->id,
            'metadata' => json_encode(['details' => 'Added library asset: ' . $request->title]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Resource item added.');
    }

    public function edit(Request $request, string $id): Response
    {
        $item = LibraryItem::where('barangay_id', $request->user()->barangay_id)->findOrFail($id);
        $meta = is_array($item->metadata) ? $item->metadata : json_decode($item->metadata ?? '{}', true);

        return Inertia::render('Admin/Library/Edit', [
            'item' => [
                'id' => $item->id,
                'title' => $item->title,
                'type' => $item->type,
                'content' => $item->content ?? '',
                'subtitle' => $meta['subtitle'] ?? '',
                'role' => $meta['role'] ?? '',
                'phone' => $meta['phone'] ?? '',
                'address' => $meta['address'] ?? '',
            ]
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:manual,contact,emergency,evacuation_center'],
        ]);

        $barangayId = $request->user()->barangay_id;
        $item = LibraryItem::where('barangay_id', $barangayId)->findOrFail($id);

        $item->update(['title' => $request->title, 'type' => $request->type]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'UPDATE',
            'entity_type' => 'LibraryItem',
            'entity_id' => $item->id,
            'metadata' => json_encode(['details' => 'Updated library item: ' . $request->title]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.library.index')->with('success', 'Library item updated.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $item = LibraryItem::where('barangay_id', $barangayId)->findOrFail($id);
        
        $savedTitle = $item->title;
        $savedId = $item->id;
        $item->delete();

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'DELETE',
            'entity_type' => 'LibraryItem',
            'entity_id' => $savedId,
            'metadata' => json_encode(['details' => 'Deleted library item: ' . $savedTitle]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Library item removed.');
    }
}