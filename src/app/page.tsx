import { HomeContent } from "./home-content";
import { WorkView } from "./work/work-grid";

// Server-side rendered page component
export default function Portfolio() {
  return <HomeContent workPreview={<WorkView entrance="wave" />} />;
}
