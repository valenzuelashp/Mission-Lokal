<?php

namespace App\Support;

use App\Models\Concern;
use App\Models\ConcernMedia;
use App\Models\Mission;
use App\Models\MissionProofMedia;

class SensitiveMediaUrl
{
    public function forConcern(Concern $concern, ConcernMedia $media): string
    {
        return route('private-media.concern', $media);
    }

    public function forProof(Mission $mission, MissionProofMedia $media): string
    {
        $concern = $mission->concern;

        return route('private-media.proof', $media);
    }
}
