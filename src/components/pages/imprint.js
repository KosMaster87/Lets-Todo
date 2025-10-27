/**
 * @fileoverview Imprint Page Component
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
          <h3>Company Information</h3>
          <p>
            <strong>Let's Todo App</strong><br>
            A todo management application<br>
            Developed by Konstantin Aksenov
          </p>
        </div>

        <div class="imprint-section">
          <h3>Developer</h3>
          <p>
            Konstantin Aksenov<br>
            Concordia-Straße<br>
            9370 Loma Plata
          </p>
        </div>

        <div class="imprint-section">
          <h3>Contact</h3>
          <p>
            Phone: +595 994 221200<br>
            E-Mail: konstantin.aksenov@dev2k.org
          </p>
        </div>

        <div class="imprint-section">
          <h3>Responsible for content according to § 55 Abs. 2 RStV</h3>
          <p>
            Konstantin Aksenov<br>
            Concordia-Straße<br>
            9370 Loma Plata
          </p>
        </div>

        <div class="imprint-section">
          <h3>Privacy Policy</h3>
          <h4>1. Privacy at a Glance</h4>
          <p>
            <strong>General Notes:</strong><br>
            The following notes provide a simple overview of what happens to your personal data when you visit this website. Personal data is any data by which you can be personally identified.
          </p>

          <h4>2. Data Collection on this Website</h4>
          <p>
            <strong>Who is responsible for data collection on this website?</strong><br>
            Data processing on this website is carried out by the website operator. You can find the contact details in the imprint of this website.
          </p>
          <p>
            <strong>How do we collect your data?</strong><br>
            Your data is collected by you providing it to us. This can be, for example, data that you enter in a contact form.
          </p>

          <h4>3. How do we use your data?</h4>
          <p>
            Part of the data is collected to ensure the error-free provision of the website. Other data can be used to analyze your user behavior.
          </p>
          <p>
            <strong>What rights do you have regarding your data?</strong><br>
            You have the right at any time to receive information free of charge about the origin, recipient, and purpose of your stored personal data.
          </p>

          <h4>4. Your Rights</h4>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Request information about your data stored with us</li>
            <li>Request correction of incorrect data</li>
            <li>Request deletion of your data</li>
            <li>Request restriction of data processing</li>
            <li>Object to data processing</li>
          </ul>
          <p>
            If you have any questions, feel free to contact us at: konstantin.aksenov@dev2k.org
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
