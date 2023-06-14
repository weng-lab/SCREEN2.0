export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <section>
            {/* I believe the search page gets nestled in here as "children", which make sit impossible to pass data directly to it */}
            {children}
        </section>
    );
}