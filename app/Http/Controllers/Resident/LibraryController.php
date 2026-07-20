<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\LibraryItem;
use Inertia\Inertia;

class LibraryController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // 1. Fetch all matching active entries for this specific barangay
        $rawItems = LibraryItem::where('barangay_id', $user->barangay_id)
            ->where('is_active', 1)
            ->orderBy('sort_order', 'asc')
            ->get();

        // 2. Transform items into the explicit LibraryManual structure expected by your TypeScript declaration
        $manuals = $rawItems->filter(fn($item) => $item->type === 'manual')
            ->map(function($item) {
                // Safeguard against missing or uninitialized JSON array offsets
                $meta = is_array($item->metadata) ? $item->metadata : [];
                
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'subtitle' => $meta['subtitle'] ?? 'Emergency Guide',
                    // Fallback map constraint ensures it never crashes on unconventional tags
                    'icon' => in_array($meta['icon'] ?? '', ['flood', 'earthquake', 'fire']) 
                        ? $meta['icon'] 
                        : 'flood',
                    'body' => $item->content ?? '',
                ];
            })->values();

        // 3. Compile hotlines, contacts, and evacuation centers into your single LibraryContact array contract
        $contacts = $rawItems->filter(fn($item) => in_array($item->type, ['contact', 'emergency', 'evacuation_center']))
            ->map(function($item) {
                // Safeguard against missing or uninitialized JSON array offsets
                $meta = is_array($item->metadata) ? $item->metadata : [];
                
                return [
                    'id' => $item->id,
                    'name' => $item->title,
                    'role' => $item->type === 'evacuation_center' 
                        ? ($meta['address'] ?? 'Evacuation Center') 
                        : ($meta['role'] ?? 'Barangay Staff'),
                    'phone' => $meta['phone'] ?? 'N/A',
                    // Explicit matching layer for frontend icon layout configurations
                    'icon' => in_array($meta['icon'] ?? '', ['office', 'fire', 'health', 'police']) 
                        ? $meta['icon'] 
                        : 'office',
                    'emergency' => $item->type === 'emergency' || ($meta['emergency'] ?? false),
                ];
            })->values();

        // 4. Render directly to your established view using matching property keys
        return Inertia::render('Resident/Library', [
            'manuals' => $manuals,
            'contacts' => $contacts,
        ]);
    }
}