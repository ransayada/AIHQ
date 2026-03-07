"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewProjectRedirect() {
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        async function createAndRedirect() {
            try {
                const res = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: "Untitled Project" }),
                });

                if (!res.ok) {
                    throw new Error("Failed to create project");
                }

                const body = await res.json();
                const id = body.data?.project?.id;

                if (id && mounted) {
                    router.replace(`/studio/${id}`);
                } else if (mounted) {
                    router.replace("/dashboard");
                }
            } catch (err) {
                console.error("Error creating new project:", err);
                if (mounted) router.replace("/dashboard");
            }
        }

        createAndRedirect();

        return () => {
            mounted = false;
        };
    }, [router]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--color-studio-900)] text-white gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent-purple)]" />
            <p className="text-sm text-[var(--color-studio-300)]">Creating your project...</p>
        </div>
    );
}
