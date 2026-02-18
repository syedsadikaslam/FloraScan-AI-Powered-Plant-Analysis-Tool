export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">

        {/* LEFT */}
        <div>
          <p>
            <strong>
              <i className="fa-solid fa-leaf"></i>{" "}
              Flora<span style={{ color: "#6cff95" }}>Scan</span>
            </strong>
            <br />
            Smart Plant Analysis using Gemini Vision
          </p>
        </div>

        {/* RIGHT */}
        <div className="social">
          <a href="https://github.com/syedsadikaslam" target="_blank">
            <i className="fa-brands fa-github"></i>
          </a>

          <a href="https://linkedin.com/in/Md-Sadik-9104a2252" target="_blank">
            <i className="fa-brands fa-linkedin"></i>
          </a>

        </div>

      </div>
    </footer>
  );
}
