/**
 * @fileoverview Imprint Page Component
 * @description Renders the imprint page with company and developer information
 * @module imprint
 */

/**
 * Renders the imprint page.
 * @returns {string} HTML string for the imprint page
 */
export const renderImprintPage = () => {
  return `
    <main class="imprint-wrapper" data-view="imprint">
      <section class="imprint-intro">
        <h2>Imprint</h2>
        <p>
          Information according to § 5 TMG
        </p>
      </section>

      <section class="imprint-content">
        <div class="imprint-section">
          <h3>Responsible for Content</h3>
          <p>
            <strong>Developer2K Software</strong><br>
            Sole Proprietor: Konstantin Aksenov<br>
            Remote
          </p>
        </div>

        <div class="imprint-section">
          <h3>Contact</h3>
          <p>
            E-Mail: konstantin@dev2ksoftware.com<br>
            Website: <a href="https://lets-todo.dev2ksoftware.com/">https://lets-todo.dev2ksoftware.com/</a>
          </p>
        </div>

        <div class="imprint-section">
          <h3>Technical Information</h3>
          <p>
            This website was built with Vanilla JavaScript and Node.js/Express. For technical inquiries, please contact us via the email address above.
          </p>
        </div>

        <div class="imprint-section">
          <h3>Privacy Policy</h3>

          <h4>1. Overview</h4>
          <p>
            Let's Todo lets you use the app in two modes: as a <strong>guest</strong>, or with a
            <strong>registered account</strong>. What data is processed, and where it is stored,
            depends entirely on which mode you use.
          </p>

          <h4>2. Guest Mode</h4>
          <p>
            As a guest, your todos are stored only in your browser's local storage. Nothing is
            transmitted to or stored on our servers. Clearing your browser data or switching
            devices means your guest data is gone - there is no server-side backup for guest
            sessions.
          </p>

          <h4>3. Registered Accounts</h4>
          <p>
            If you register, we store the following data on our own server, in a database we
            operate ourselves (not a third-party cloud provider):
          </p>
          <ul>
            <li>Your e-mail address (used for login and password reset)</li>
            <li>Your password - never in plain text, only as a one-way bcrypt hash that cannot be reversed to recover the original password</li>
            <li>Your todos (titles and content)</li>
            <li>Optional preferences you set (e.g. theme, language)</li>
          </ul>
          <p>
            Each registered account gets its own dedicated database, isolated from other users'
            data.
          </p>

          <h4>4. Cookies</h4>
          <p>
            We set exactly one cookie, used solely to keep you logged in (an <code>httpOnly</code>,
            secure session cookie). It is not used for tracking, advertising, or analytics. We do
            not use any third-party analytics or tracking scripts on this site.
          </p>

          <h4>5. E-Mail</h4>
          <p>
            We send e-mail only for password-reset requests you initiate yourself, via our own
            mail relay. We do not send marketing e-mail and do not share your address with third
            parties.
          </p>

          <h4>6. Your Rights</h4>
          <p>You have the right to:</p>
          <ul>
            <li>Request a copy of the data we hold about you - you can also export your own todos as JSON at any time from within the app</li>
            <li>Request correction of incorrect data</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Request restriction of processing, or object to it</li>
          </ul>
          <p>
            Account deletion is currently handled manually: contact us at the address below and
            we will delete your account, your database, and all associated data.
          </p>
          <p>
            For any privacy request or question, contact: konstantin@dev2ksoftware.com
          </p>
        </div>
      </section>

      <nav class="imprint-menu">
        <button class="menu-btn imprint-cancel-btn" id="imprintCancelBtn">
          <div class="btn-icon imprint-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Back</h3>
            <p>Back to Settings</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
