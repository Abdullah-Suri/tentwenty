export function Footer() {
  return (
    <footer className="px-4 py-12 container mx-auto">
      <div className=" w-full bg-card text-card-foreground rounded-xl border shadow-sm py-8 mb-12">
        <div className="px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} tentwenty. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
