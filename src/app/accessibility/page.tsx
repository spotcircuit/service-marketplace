export const dynamic = 'force-static';

export default function AccessibilityPage() {
  return (
    <main className="px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Accessibility Statement</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-gray max-w-none">
          <p>
            We are committed to making our website accessible to all users, including people with disabilities.
            We strive to follow best practices and relevant standards, including the Web Content Accessibility
            Guidelines (WCAG) 2.1.
          </p>

          <h2>Our Efforts</h2>
          <ul>
            <li>Semantic HTML and ARIA attributes where appropriate</li>
            <li>Keyboard navigable components and focus visibility</li>
            <li>Color contrast meeting AA guidelines for text and UI elements</li>
            <li>Text alternatives for non-text content</li>
          </ul>

          <h2>Ongoing Improvements</h2>
          <p>
            Accessibility is an ongoing effort. We regularly test and iterate to improve the experience for all
            users. If you encounter an accessibility barrier, please let us know.
          </p>

          <h2>Contact</h2>
          <p>
            Feedback helps us do better. Contact us at <a href="mailto:support@dumpquote.co">support@dumpquote.co</a>
            {' '}or call <a href="tel:+14342076559">(434) 207-6559</a> to report issues or request accommodations.
          </p>
        </div>
      </div>
    </main>
  );
}
