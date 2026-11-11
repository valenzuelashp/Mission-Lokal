import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, Compass, Facebook, FileText, Github, HardHat, Instagram, MapPin, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
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
    const className = 'flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300';

    if (!href) return null;

    return (
        <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
            <Icon className="h-4 w-4" />
        </a>
    );
}

const residentPages = [
    { title: 'Public feed', file: 'homepage-1.png' },
    { title: 'News', file: 'homepage-2.png' },
    { title: 'Calendar', file: 'homepage-5.png' },
    { title: 'Library', file: 'homepage-3.png' },
    { title: 'Profile', file: 'homepage-4.png' },
];

function ResidentPageShot({ title, file }: { title: string; file: string }) {
    const [missing, setMissing] = useState(false);

    if (missing) {
        return (
            <div className="flex h-[240px] w-[158px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-3 text-center shadow-lg shadow-slate-900/10 sm:h-[300px] sm:w-[196px]">
                <p className="text-[11px] font-black text-slate-900">{title}</p>
                <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-500">public/images/{file}</p>
            </div>
        );
    }

    return (
        <img
            src={`/images/${file}`}
            alt={title}
            className="h-[240px] w-[158px] rounded-xl border border-slate-200 bg-white object-cover object-top shadow-lg shadow-slate-900/10 sm:h-[300px] sm:w-[196px]"
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
            <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
                    <div className="flex items-center gap-3">
                        <img src="/images/mission-lokal-logo.png" alt="" className="h-10 w-10 object-contain" />
                        <p className="text-lg font-bold tracking-tight">Mission-Lokal</p>
                    </div>
                    <Button asChild className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                        <Link href="/login">Sign in</Link>
                    </Button>
                </header>

                <main className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
                    <section className="relative overflow-hidden rounded-[1.5rem] bg-[#102337] px-6 py-10 text-white shadow-lg shadow-slate-900/10 sm:px-10 sm:py-14 lg:px-16 lg:py-20">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.19),transparent_45%)]" />
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-full opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:48px_48px]" />
                        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-16">
                            <div className="max-w-2xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Barangay concern and response</p>
                                <h1 className="mt-5 max-w-2xl text-balance text-3xl font-semibold leading-[1.16] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                                    A reported concern should become a mission, not a forgotten note.
                                </h1>
                                <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                                    Mission-Lokal is the website a barangay shares with its residents. People report problems in the community, follow what happens next, and request everyday certificates.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <Button asChild className="h-12 w-full rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white shadow-md shadow-blue-950/20 hover:bg-blue-400 sm:w-auto">
                                        <Link href="/register">Register as a resident</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-12 w-full rounded-lg border-white/25 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto">
                                        <Link href="/login">I already have an account</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="mx-auto flex aspect-square w-44 items-center justify-center rounded-full border border-white/15 bg-white/5 shadow-[0_0_0_24px_rgba(255,255,255,0.025)] sm:w-64 lg:w-full lg:max-w-[19rem]">
                                <img src="/images/mission-lokal-logo.png" alt="Mission-Lokal seal" className="h-3/4 w-3/4 object-contain drop-shadow-xl" />
                            </div>
                        </div>
                    </section>

                    <section className="mt-14 grid gap-4 md:grid-cols-3" aria-label="How Mission-Lokal works">
                        {steps.map((step, index) => (
                            <article key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 sm:p-7">
                                <span className="absolute right-6 top-7 text-sm font-semibold tracking-widest text-slate-400">0{index + 1}</span>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <h2 className="mt-6 text-lg font-semibold tracking-tight">{step.title}</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{step.text}</p>
                            </article>
                        ))}
                    </section>

                    <section className="mt-16 overflow-hidden rounded-[1.5rem] border border-blue-100 bg-[#eaf2fb] px-5 py-10 sm:px-8 sm:py-14">
                        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">For residents</p>
                        <h2 className="mx-auto mt-3 max-w-xl text-balance text-center text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                            The pages a resident opens
                        </h2>
                        <div className="mt-10 flex gap-4 overflow-x-auto pb-3 lg:justify-center lg:gap-5">
                            {residentPages.map((page) => (
                                <figure key={page.file} className="shrink-0">
                                    <ResidentPageShot title={page.title} file={page.file} />
                                    <figcaption className="mt-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-600">{page.title}</figcaption>
                                </figure>
                            ))}
                        </div>
                    </section>

                    <section className="mt-16 grid gap-4 lg:grid-cols-5">
                        <article className="relative overflow-hidden rounded-2xl bg-[#173a5c] p-7 text-white sm:p-10 lg:col-span-3">
                            <Compass className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-white/[0.07]" />
                            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Vision</p>
                            <h2 className="relative mt-5 max-w-lg text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                                A barangay where every concern is seen through to a response.
                            </h2>
                            <p className="relative mt-5 max-w-lg text-base leading-7 text-blue-100">
                                Residents know where to report. The barangay can see what is waiting, who is assigned, and what was done. The record stays with the community, not in a stack of paper.
                            </p>
                        </article>
                        <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 sm:p-10 lg:col-span-2">
                            <div>
                                <Users className="h-6 w-6 text-blue-700" />
                                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Mission</p>
                                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight tracking-tight">Turn community reports into work the barangay can assign and follow.</h2>
                            </div>
                            <p className="mt-5 text-base leading-7 text-slate-600">
                                Mission-Lokal gives residents a place to file a concern with a location, and gives barangay staff and personnel a shared place to review it, send someone out, and keep the resident informed.
                            </p>
                        </article>
                    </section>

                    <section className="mt-16">
                        <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Who uses it</h2>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <article className="rounded-2xl border border-slate-200 bg-white p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold">Residents</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Register, report a concern, and request a barangay document.</p>
                            </article>
                            <article className="rounded-2xl border border-slate-200 bg-white p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold">Barangay staff</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Review reports, prepare certificates, and keep the directory updated.</p>
                            </article>
                            <article className="rounded-2xl border border-slate-200 bg-white p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <HardHat className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold">Personnel</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Receive an assignment and record the response in the field.</p>
                            </article>
                        </div>
                        <div className="mt-4 flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                            <p className="text-sm leading-6 text-slate-600 sm:text-base">Barangay staff and personnel sign in through the command portal.</p>
                            <Button asChild className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                                <Link href="/admin-personnel/login">Open the command portal</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="mt-16 overflow-hidden rounded-[1.5rem] bg-[#102337] p-5 text-white sm:p-8 lg:p-10">
                        <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
                            <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 sm:min-h-[26rem]">
                                {selected ? (
                                    <div className="flex h-full flex-col sm:min-h-[26rem]">
                                        <div className="relative min-h-[16rem] flex-1 sm:min-h-[18rem]">
                                            <DeveloperFace person={selected} className="absolute inset-0 h-full w-full text-6xl" />
                                        </div>
                                        <div className="px-5 py-5 text-center">
                                            <h3 className="text-balance text-xl font-semibold leading-snug tracking-tight sm:text-2xl">{selected.name}</h3>
                                            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-sky-300">Developer · Founder</p>
                                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">{selected.detail}</p>
                                            <div className="mt-4 flex justify-center gap-2">
                                                <SocialIcon href={selected.github} label={`${selected.name} on GitHub`} icon={Github} />
                                                <SocialIcon href={selected.facebook} label={`${selected.name} on Facebook`} icon={Facebook} />
                                                <SocialIcon href={selected.instagram} label={`${selected.name} on Instagram`} icon={Instagram} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-full sm:min-h-[26rem]">
                                        <img
                                            src="/images/tup-manila.png"
                                            alt="Technological University of the Philippines, Manila"
                                            className="absolute inset-0 h-full w-full bg-[#f3efe8] object-contain object-center"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                                        <div className="relative flex h-full min-h-[22rem] flex-col justify-end p-6 sm:min-h-[26rem] sm:p-8">
                                            <p className="text-balance text-xs font-semibold uppercase tracking-widest text-sky-200">Technological University of the Philippines, Manila</p>
                                            <h3 className="mt-2 text-balance text-2xl font-semibold leading-snug tracking-tight">Information Technology students</h3>
                                            <p className="mt-3 text-sm leading-6 text-slate-100 sm:text-base">
                                                We are TUP students who collaborated on a thesis project and came up with the Mission-Lokal idea. The four of us are Information Technology students, and this website is what we built together.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </article>

                            <div className="flex flex-col">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">Developers</h2>
                                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300 sm:text-base">
                                            Bachelor of Science in Information Technology, Technological University of the Philippines, Manila.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => showNeighbor(-1)}
                                            aria-label="Previous developer"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-colors hover:bg-white/15"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => showNeighbor(1)}
                                            aria-label="Next developer"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-colors hover:bg-white/15"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedId(null)}
                                    className={`mt-6 self-start text-xs font-semibold uppercase tracking-widest ${selected ? 'text-sky-300 hover:text-white' : 'text-white'}`}
                                >
                                    TUP Manila
                                </button>

                                <div className="mt-4 grid flex-1 grid-cols-2 content-start gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                                    {developers.map((person) => (
                                        <button
                                            key={person.id}
                                            type="button"
                                            onClick={() => setSelectedId(person.id)}
                                            aria-pressed={selected?.id === person.id}
                                            className={`rounded-xl border p-2 text-left transition-colors ${selected?.id === person.id ? 'border-sky-300 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <DeveloperFace person={person} className="aspect-square w-full rounded-lg text-2xl" />
                                            <p className="mt-2 px-1 text-sm font-semibold">{person.shortName}</p>
                                            <p className="px-1 text-xs text-slate-400">Developer · Founder</p>
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
