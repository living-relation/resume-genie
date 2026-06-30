export default function Privacy() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        How Resume Genie handles your data.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-base font-semibold">What we store</h2>
          <p className="mt-2 text-muted-foreground">
            Resume Genie lets you paste the text of your resumes, cover letters, and
            portfolio items, and add job listings. That content is stored so the
            app can generate tailored documents for you. We do not require an
            account: your data is scoped to an anonymous, randomly generated
            identifier kept in a secure cookie on your browser.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            We use a single essential cookie to keep your workspace separate from
            other visitors. Our advertising partner (Google AdSense) may also set
            cookies to display and measure ads. For visitors in the EEA, the UK,
            and Switzerland, no personalized ad cookies or signals are stored
            until you make a choice in the consent dialog described below.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Advertising &amp; consent</h2>
          <p className="mt-2 text-muted-foreground">
            Resume Genie is free and supported by ads served through Google AdSense.
            Google and its partners may use cookies to serve ads based on your
            prior visits to this and other sites. Visitors in the EEA, the UK, and
            Switzerland are shown a Google-certified consent management platform
            (CMP) and we apply Google Consent Mode v2, so personalized advertising
            is enabled only with your consent. You can change or withdraw your
            choice at any time using the “Privacy choices” link in the footer. Learn
            more about how Google uses data at{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              policies.google.com/technologies/partner-sites
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">AI processing</h2>
          <p className="mt-2 text-muted-foreground">
            To generate tailored resumes and cover letters, the content you provide
            is sent to our AI provider (OpenAI) for processing. It is used only to
            produce your requested output.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Your choices</h2>
          <p className="mt-2 text-muted-foreground">
            You can delete your uploaded documents, jobs, and generated
            applications at any time from within the app. Clearing your browser
            cookies will detach you from your stored workspace.
          </p>
        </section>
      </div>
    </div>
  );
}
