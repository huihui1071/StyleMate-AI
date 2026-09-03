import { AdvisorApp } from "./Advisor";
import { LandingPage } from "./LandingPage";

function App() {
  return window.location.pathname.startsWith("/demo") ? <AdvisorApp /> : <LandingPage />;
}

export default App;
