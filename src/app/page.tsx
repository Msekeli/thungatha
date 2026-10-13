import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#07172a] px-6 py-12 font-sans">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <Image
          src="/brand/thungatha-logo.svg"
          alt="Thungatha"
          width={450}
          height={126}
          priority
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Your next opportunity starts here.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            An AI-assisted workspace for discovering jobs and managing your
            applications with confidence.
          </p>
        </div>
      </main>
    </div>
  );
}
