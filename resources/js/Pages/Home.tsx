import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, Compass, Facebook, FileText, Github, Globe, HardHat, Instagram, MapPin, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const steps = [
    {
        icon: MapPin,
        title: 'Report a concern',
        text: 'A resident pins the place and describes what needs attention, such as flooding, waste, or a broken street light.',
    },
    {
        icon: ShieldCheck,
        title: 'The barangay reviews it',
        text: 'Staff check the report, see what needs attention first, and assign personnel when a response is required.',
    },
    {
        icon: FileText,
        title: 'The response is recorded',
        text: 'Personnel update the assignment. Residents can also request everyday barangay certificates from the same site.',
    },
];

const developers = [
    {
        id: 'karl',
        name: 'Karl Cedrick R. Namuco',
        shortName: 'Karl',
        initials: 'KN',
        tone: 'bg-sky-800',
        github: 'https://github.com/Karl-Namuco',
        facebook: '',
        instagram: '',
        website: '',
        detail: 'Information Technology student at the Technological University of the Philippines, Manila, and one of the four developers of Mission-Lokal.',
    },
    {
        id: 'timothy',
        name: 'Timothy A. Talagtag',
        shortName: 'Timothy',
        initials: 'TT',
        tone: 'bg-blue-800',
        github: 'https://github.com/timotiii19',
        facebook: '',
        instagram: '',
        website: '',
        detail: 'Information Technology student at the Technological University of the Philippines, Manila, and one of the four developers of Mission-Lokal.',
    },
    {
        id: 'sharmaine',
        name: 'Sharmaine Hannah P. Valenzuela',
        shortName: 'Sharmaine',
        initials: 'SV',
        tone: 'bg-blue-700',
        photo: '/images/team/sharmaine-valenzuela.png',
        github: 'https://github.com/valenzuelashp',
        facebook: '',
        instagram: '',
        website: '',
        detail: 'Information Technology student at the Technological University of the Philippines, Manila, and one of the four developers of Mission-Lokal.',
    },
    {
        id: 'charles',
        name: 'Charles Justin R. Vizcarra',
        shortName: 'Charles',
        initials: 'CV',
        tone: 'bg-indigo-800',
        github: 'https://github.com/Charles-Vizcarra',
        facebook: '',
        instagram: '',
        website: '',
        detail: 'Information Technology student at the Technological University of the Philippines, Manila, and one of the four developers of Mission-Lokal.',
    },
];

function SocialIcon({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
    const className = 'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20';

    if (!href) {
        return (
            <span className={className} title={`${label} — paste the link in Home.tsx`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{label}</span>
            </span>
        );
    }

    return (
        <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
            <Icon className="h-4 w-4" />
        </a>
    );
}

const residentPages = [
    { title: 'Public feed', file: 'homepage-1.png', rotate: -14, shift: -260 },
    { title: 'News', file: 'homepage-2.png', rotate: -7, shift: -130 },
    { title: 'Calendar', file: 'homepage-5.png', rotate: 0, shift: 0 },
    { title: 'Library', file: 'homepage-3.png', rotate: 7, shift: 130 },
    { title: 'Profile', file: 'homepage-4.png', rotate: 14, shift: 260 },
];

function ResidentPageShot({ title, file }: { title: string; file: string }) {
    const [missing, setMissing] = useState(false);

    if (missing) {
        return (
            <div className="flex h-[300px] w-[196px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-3 text-center shadow-2xl">
                <p className="text-[11px] font-black text-slate-900">{title}</p>
                <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-500">public/images/{file}</p>
            </div>
        );
    }

    return (
        <img
            src={`/images/${file}`}
            alt={title}
            className="h-[300px] w-[196px] rounded-2xl bg-white object-cover object-top shadow-2xl"
            onError={() => setMissing(true)}
        />
    );
}

function DeveloperFace({ person, className }: { person: (typeof developers)[number]; className: string }) {
    if (person.photo) {
        return <img src={person.photo} alt="" className={`object-cover ${className}`} />;
    }

    return (
        <span className={`flex items-center justify-center font-black text-white ${person.tone} ${className}`}>
            {person.initials}
        </span>
    );
}

export default function Home() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = developers.find((person) => person.id === selectedId) ?? null;

    const showNeighbor = (direction: 1 | -1) => {
        if (!selected) {
            setSelectedId(direction === 1 ? developers[0].id : developers[developers.length - 1].id);
            return;
        }

        const index = developers.findIndex((person) => person.id === selected.id);
        const next = (index + direction + developers.length) % developers.length;
        setSelectedId(developers[next].id);
    };
    return (
        <>
            <Head title="Mission-Lokal" />
            <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
                <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
                    <div className="flex items-center gap-3">
                        <img src="/images/mission-lokal-logo.png" alt="" className="h-11 w-11 object-contain" />
                        <p className="text-sm font-black tracking-tight">Mission-Lokal</p>
                    </div>
                    <Button asChild variant="outline" className="h-10 rounded-xl bg-white font-bold">
                        <Link href="/login">Sign in</Link>
                    </Button>
                </header>

                <main className="mx-auto w-full max-w-6xl px-5 pb-16">
                    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
                        <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr]">
                            <img
                                src="/images/mission-lokal-logo.png"
                                alt="Mission-Lokal seal"
                                className="mx-auto h-40 w-40 object-contain drop-shadow-2xl sm:h-48 sm:w-48"
                            />
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">Barangay concern and response</p>
                                <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                                    A reported concern should become a mission, not a forgotten note.
                                </h1>
                                <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-300">
                                    Mission-Lokal is the website a barangay shares with its residents. People report problems in the community, follow what happens next, and request everyday certificates.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Button asChild className="h-11 rounded-2xl bg-blue-500 font-bold text-white hover:bg-blue-400">
                                        <Link href="/register">Create a resident account</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-11 rounded-2xl border-white/20 bg-white/10 font-bold text-white hover:bg-white/20 hover:text-white">
                                        <Link href="/login">I already have an account</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 grid gap-3 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <article key={step.title} className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                <span className="pointer-events-none absolute -right-1 -top-5 text-7xl font-black tracking-tighter text-slate-100">0{index + 1}</span>
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <h2 className="relative mt-5 text-base font-black tracking-tight">{step.title}</h2>
                                <p className="relative mt-2 text-sm font-medium leading-6 text-slate-600">{step.text}</p>
                            </article>
                        ))}
                    </section>

                    <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-b from-blue-700 to-blue-900 px-4 py-10 text-white shadow-xl sm:px-6">
                        <p className="text-center text-xs font-black uppercase tracking-[0.22em] text-sky-200">For residents</p>
                        <h2 className="mx-auto mt-3 max-w-xl text-center text-3xl font-black tracking-tight sm:text-4xl">
                            The pages a resident opens
                        </h2>
                        <div className="relative mx-auto mt-8 hidden h-[390px] max-w-5xl md:block">
                            {residentPages.map((page) => (
                                <div
                                    key={page.file}
                                    className="absolute top-4 left-1/2 origin-bottom"
                                    style={{
                                        transform: `translateX(calc(-50% + ${page.shift}px)) rotate(${page.rotate}deg)`,
                                        zIndex: page.rotate === 0 ? 30 : 20 - Math.abs(page.rotate),
                                    }}
                                >
                                    <ResidentPageShot title={page.title} file={page.file} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 md:hidden">
                            {residentPages.map((page) => (
                                <div key={page.file} className="shrink-0">
                                    <ResidentPageShot title={page.title} file={page.file} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 grid gap-3 lg:grid-cols-5">
                        <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-950 p-8 text-white shadow-xl sm:p-10 lg:col-span-3">
                            <Compass className="pointer-events-none absolute -right-10 -top-12 h-64 w-64 text-white/10" />
                            <div className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl" />
                            <p className="relative text-xs font-black uppercase tracking-[0.22em] text-sky-200">Vision</p>
                            <h2 className="relative mt-4 max-w-lg text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                                A barangay where every concern is seen through to a response.
                            </h2>
                            <p className="relative mt-6 max-w-md text-sm font-medium leading-7 text-blue-100">
                                Residents know where to report. The barangay can see what is waiting, who is assigned, and what was done. The record stays with the community, not in a stack of paper.
                            </p>
                        </article>
                        <article className="flex flex-col justify-between rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl sm:p-10 lg:col-span-2">
                            <div>
                                <Users className="h-6 w-6 text-sky-300" />
                                <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-sky-300">Mission</p>
                                <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight">Turn community reports into work the barangay can assign and follow.</h2>
                            </div>
                            <p className="mt-6 text-sm font-medium leading-7 text-slate-300">
                                Mission-Lokal gives residents a place to file a concern with a location, and gives barangay staff and personnel a shared place to review it, send someone out, and keep the resident informed.
                            </p>
                        </article>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-black tracking-tight">Who uses it</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-black">Residents</h3>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Register, report a concern, and request a barangay document.</p>
                            </article>
                            <article className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-xl">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-black">Barangay staff</h3>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-300">Review reports, prepare certificates, and keep the directory updated.</p>
                            </article>
                            <article className="rounded-[1.75rem] bg-blue-700 p-6 text-white shadow-xl">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                                    <HardHat className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-black">Personnel</h3>
                                <p className="mt-2 text-sm font-medium leading-6 text-blue-100">Receive an assignment and record the response in the field.</p>
                            </article>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
                            <p className="text-sm font-semibold text-slate-600">Barangay staff and personnel sign in through the command portal.</p>
                            <Button asChild variant="outline" className="h-10 rounded-xl bg-white font-bold">
                                <Link href="/admin-personnel/login">Open the command portal</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl sm:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl" />
                        <div className="relative grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                            <article className="min-h-[32rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900">
                                {selected ? (
                                    <div className="flex h-full min-h-[32rem] flex-col">
                                        <div className="relative min-h-[22rem] flex-1">
                                            <DeveloperFace person={selected} className="absolute inset-0 h-full w-full text-6xl" />
                                        </div>
                                        <div className="px-5 py-5 text-center">
                                            <h3 className="text-2xl font-black tracking-tight">{selected.name}</h3>
                                            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-sky-300">Developer · Founder</p>
                                            <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-300">{selected.detail}</p>
                                            <div className="mt-4 flex justify-center gap-2">
                                                <SocialIcon href={selected.github} label={`${selected.name} on GitHub`} icon={Github} />
                                                <SocialIcon href={selected.facebook} label={`${selected.name} on Facebook`} icon={Facebook} />
                                                <SocialIcon href={selected.instagram} label={`${selected.name} on Instagram`} icon={Instagram} />
                                                <SocialIcon href={selected.website} label={`${selected.name}'s website`} icon={Globe} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-full min-h-[32rem]">
                                        <img
                                            src="/images/tup-manila.png"
                                            alt="Technological University of the Philippines, Manila"
                                            className="absolute inset-0 h-full w-full bg-[#f3efe8] object-contain object-center"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                                        <div className="relative flex h-full min-h-[32rem] flex-col justify-end p-6 sm:p-8">
                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Technological University of the Philippines, Manila</p>
                                            <h3 className="mt-2 text-2xl font-black tracking-tight">Information Technology students</h3>
                                            <p className="mt-3 text-sm font-medium leading-6 text-slate-100">
                                                We are TUP students who collaborated on a thesis project and came up with the Mission-Lokal idea. The four of us are Information Technology students, and this website is what we built together.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </article>

                            <div className="flex flex-col">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">Developers</h2>
                                        <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-300">
                                            Bachelor of Science in Information Technology, Technological University of the Philippines, Manila.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => showNeighbor(-1)}
                                            aria-label="Previous developer"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => showNeighbor(1)}
                                            aria-label="Next developer"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedId(null)}
                                    className={`mt-4 self-start text-xs font-black uppercase tracking-[0.16em] ${selected ? 'text-sky-300 hover:text-white' : 'text-white'}`}
                                >
                                    TUP Manila
                                </button>

                                <div className="mt-4 grid flex-1 grid-cols-2 content-start gap-3">
                                    {developers.map((person) => (
                                        <button
                                            key={person.id}
                                            type="button"
                                            onClick={() => setSelectedId(person.id)}
                                            aria-pressed={selected?.id === person.id}
                                            className={`rounded-2xl p-2 text-left ${selected?.id === person.id ? 'bg-white/10 ring-2 ring-sky-300' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <DeveloperFace person={person} className="aspect-square w-full rounded-xl text-2xl" />
                                            <p className="mt-2 px-1 text-sm font-black">{person.shortName}</p>
                                            <p className="px-1 text-xs font-semibold text-slate-400">Developer · Founder</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
