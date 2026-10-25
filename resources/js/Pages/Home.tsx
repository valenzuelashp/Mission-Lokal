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
        photo: '/images/team/karl-namuco.jpg',
        facebook: 'https://www.facebook.com/karlcedrick.namuco',
        instagram: 'https://www.instagram.com/karlceds_n/',
        website: '',
        detail: 'Information Technology student at the Technological University of the Philippines, Manila, and one of the four developers of Mission-Lokal.',
    },
    {
        id: 'timothy',
        name: 'Timothy A. Talagtag',
        shortName: 'Timothy',
        initials: 'TT',
        tone: 'bg-blue-800',
        photo: '/images/team/timothy-talagtag.jpg',
        github: 'https://github.com/timotiii19',
        facebook: 'https://www.facebook.com/Timotiiiii19',
        instagram: 'https://www.instagram.com/timxtiii_xx/',
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
        facebook: 'https://www.facebook.com/Sharumainu',
        instagram: 'https://www.instagram.com/ishkidush/',
        website: '',
        detail: 'Information Technology student at the Technological University of the Philippines, Manila, and one of the four developers of Mission-Lokal.',
    },
    {
        id: 'charles',
        name: 'Charles Justin R. Vizcarra',
        shortName: 'Charles',
        initials: 'CV',
        tone: 'bg-indigo-800',
        photo: '/images/team/charles-vizcarra.jpg',
        github: 'https://github.com/Charles-Vizcarra',
        facebook: 'https://www.facebook.com/charles.justin.vizcarra.2025',
        instagram: 'https://www.instagram.com/cj.vzcrr/',
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
            <div className="flex h-[240px] w-[158px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-3 text-center shadow-2xl sm:h-[300px] sm:w-[196px]">
                <p className="text-[11px] font-black text-slate-900">{title}</p>
                <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-500">public/images/{file}</p>
            </div>
        );
    }

    return (
        <img
            src={`/images/${file}`}
            alt={title}
            className="h-[240px] w-[158px] rounded-2xl bg-white object-cover object-top shadow-2xl sm:h-[300px] sm:w-[196px]"
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
                <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex items-center gap-2.5">
                        <img src="/images/mission-lokal-logo.png" alt="" className="h-9 w-9 object-contain sm:h-11 sm:w-11" />
                        <p className="text-base font-black tracking-tight">Mission-Lokal</p>
                    </div>
                    <Button asChild variant="outline" className="h-11 rounded-xl bg-white px-4 text-base font-bold">
                        <Link href="/login">Sign in</Link>
                    </Button>
                </header>

                <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-5">
                    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-7 text-white shadow-xl sm:rounded-[2rem] sm:px-10 sm:py-14">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
                        <div className="relative grid items-center gap-5 sm:gap-10 lg:grid-cols-[auto_1fr]">
                            <img
                                src="/images/mission-lokal-logo.png"
                                alt="Mission-Lokal seal"
                                className="mx-auto h-24 w-24 object-contain drop-shadow-2xl sm:h-48 sm:w-48"
                            />
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.12em] text-sky-300 text-balance sm:font-black sm:tracking-[0.22em]">Barangay concern and response</p>
                                <h1 className="mt-2 max-w-xl text-balance text-[1.75rem] font-black leading-snug tracking-tight sm:mt-3 sm:text-5xl sm:leading-tight">
                                    A reported concern should become a mission, not a forgotten note.
                                </h1>
                                <p className="mt-3 max-w-xl text-base font-medium leading-6 text-slate-300 sm:mt-4">
                                    Mission-Lokal is the website a barangay shares with its residents. People report problems in the community, follow what happens next, and request everyday certificates.
                                </p>
                                <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                                    <Button asChild className="h-11 w-full rounded-2xl bg-blue-500 text-base font-bold text-white hover:bg-blue-400 sm:w-auto">
                                        <Link href="/register">Create a resident account</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-11 w-full rounded-2xl border-white/20 bg-white/10 text-base font-bold text-white hover:bg-white/20 hover:text-white sm:w-auto">
                                        <Link href="/login">I already have an account</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 grid gap-3 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <article key={step.title} className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:rounded-[1.75rem] sm:p-6">
                                <span className="pointer-events-none absolute -right-1 -top-4 text-6xl font-black tracking-tighter text-slate-100 sm:-top-5 sm:text-7xl">0{index + 1}</span>
                                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <h2 className="relative mt-4 text-lg font-black tracking-tight">{step.title}</h2>
                                <p className="relative mt-1.5 text-base font-medium leading-6 text-slate-600">{step.text}</p>
                            </article>
                        ))}
                    </section>

                    <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-b from-blue-700 to-blue-900 px-4 py-7 text-white shadow-xl sm:mt-8 sm:rounded-[2rem] sm:px-6 sm:py-10">
                        <p className="text-center text-sm font-bold uppercase tracking-[0.12em] text-sky-200 sm:font-black sm:tracking-[0.22em]">For residents</p>
                        <h2 className="mx-auto mt-2 max-w-xl text-balance text-center text-2xl font-black leading-snug tracking-tight sm:mt-3 sm:text-4xl">
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

                    <section className="mt-6 grid gap-3 lg:grid-cols-5 sm:mt-8">
                        <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-950 p-5 text-white shadow-xl sm:rounded-[2rem] sm:p-10 lg:col-span-3">
                            <Compass className="pointer-events-none absolute -right-10 -top-12 h-64 w-64 text-white/10" />
                            <div className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl" />
                            <p className="relative text-sm font-bold uppercase tracking-[0.12em] text-sky-200 sm:font-black sm:tracking-[0.22em]">Vision</p>
                            <h2 className="relative mt-3 max-w-lg text-balance text-2xl font-black leading-snug tracking-tight sm:mt-4 sm:text-4xl">
                                A barangay where every concern is seen through to a response.
                            </h2>
                            <p className="relative mt-4 max-w-md text-base font-medium leading-6 text-blue-100 sm:mt-6">
                                Residents know where to report. The barangay can see what is waiting, who is assigned, and what was done. The record stays with the community, not in a stack of paper.
                            </p>
                        </article>
                        <article className="flex flex-col justify-between rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:rounded-[2rem] sm:p-10 lg:col-span-2">
                            <div>
                                <Users className="h-6 w-6 text-sky-300" />
                                <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-sky-300 sm:mt-5 sm:font-black sm:tracking-[0.22em]">Mission</p>
                                <h2 className="mt-2 text-balance text-2xl font-black leading-snug tracking-tight sm:mt-3">Turn community reports into work the barangay can assign and follow.</h2>
                            </div>
                            <p className="mt-4 text-base font-medium leading-6 text-slate-300 sm:mt-6">
                                Mission-Lokal gives residents a place to file a concern with a location, and gives barangay staff and personnel a shared place to review it, send someone out, and keep the resident informed.
                            </p>
                        </article>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-black leading-snug tracking-tight">Who uses it</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:rounded-[1.75rem] sm:p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-lg font-black">Residents</h3>
                                <p className="mt-1.5 text-base font-medium leading-6 text-slate-600">Register, report a concern, and request a barangay document.</p>
                            </article>
                            <article className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:rounded-[1.75rem] sm:p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-lg font-black">Barangay staff</h3>
                                <p className="mt-1.5 text-base font-medium leading-6 text-slate-300">Review reports, prepare certificates, and keep the directory updated.</p>
                            </article>
                            <article className="rounded-3xl bg-blue-700 p-5 text-white shadow-xl sm:rounded-[1.75rem] sm:p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                                    <HardHat className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-lg font-black">Personnel</h3>
                                <p className="mt-1.5 text-base font-medium leading-6 text-blue-100">Receive an assignment and record the response in the field.</p>
                            </article>
                        </div>
                        <div className="mt-3 flex flex-col items-stretch gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-[1.75rem]">
                            <p className="text-base font-semibold leading-6 text-slate-600">Barangay staff and personnel sign in through the command portal.</p>
                            <Button asChild variant="outline" className="h-11 w-full rounded-xl bg-white text-base font-bold sm:w-auto">
                                <Link href="/admin-personnel/login">Open the command portal</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="relative mt-6 overflow-hidden rounded-3xl bg-slate-950 p-4 text-white shadow-xl sm:mt-8 sm:rounded-[2rem] sm:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl" />
                        <div className="relative grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                            <article className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 sm:min-h-[32rem] sm:rounded-[1.75rem]">
                                {selected ? (
                                    <div className="flex h-full flex-col sm:min-h-[32rem]">
                                        <div className="relative min-h-[16rem] flex-1 sm:min-h-[22rem]">
                                            <DeveloperFace person={selected} className="absolute inset-0 h-full w-full text-6xl" />
                                        </div>
                                        <div className="px-4 py-4 text-center sm:px-5 sm:py-5">
                                            <h3 className="text-balance text-xl font-black leading-snug tracking-tight sm:text-2xl">{selected.name}</h3>
                                            <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-sky-300">Developer · Founder</p>
                                            <p className="mx-auto mt-3 max-w-md text-base font-medium leading-6 text-slate-300">{selected.detail}</p>
                                            <div className="mt-4 flex justify-center gap-2">
                                                <SocialIcon href={selected.github} label={`${selected.name} on GitHub`} icon={Github} />
                                                <SocialIcon href={selected.facebook} label={`${selected.name} on Facebook`} icon={Facebook} />
                                                <SocialIcon href={selected.instagram} label={`${selected.name} on Instagram`} icon={Instagram} />
                                                <SocialIcon href={selected.website} label={`${selected.name}'s website`} icon={Globe} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-full sm:min-h-[32rem]">
                                        <img
                                            src="/images/tup-manila.png"
                                            alt="Technological University of the Philippines, Manila"
                                            className="absolute inset-0 h-full w-full bg-[#f3efe8] object-contain object-center"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                                        <div className="relative flex h-full min-h-[22rem] flex-col justify-end p-5 sm:min-h-[32rem] sm:p-8">
                                            <p className="text-balance text-sm font-bold uppercase tracking-[0.1em] text-sky-200">Technological University of the Philippines, Manila</p>
                                            <h3 className="mt-2 text-balance text-xl font-black leading-snug tracking-tight sm:text-2xl">Information Technology students</h3>
                                            <p className="mt-2 text-base font-medium leading-6 text-slate-100 sm:mt-3">
                                                We are TUP students who collaborated on a thesis project and came up with the Mission-Lokal idea. The four of us are Information Technology students, and this website is what we built together.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </article>

                            <div className="flex flex-col">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black leading-snug tracking-tight sm:text-3xl">Developers</h2>
                                        <p className="mt-2 max-w-sm text-base font-medium leading-6 text-slate-300 sm:mt-3">
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
                                    className={`mt-4 self-start text-sm font-bold uppercase tracking-[0.12em] ${selected ? 'text-sky-300 hover:text-white' : 'text-white'}`}
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
                                            <p className="mt-2 px-1 text-base font-black">{person.shortName}</p>
                                            <p className="px-1 text-sm font-semibold text-slate-400">Developer · Founder</p>
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
