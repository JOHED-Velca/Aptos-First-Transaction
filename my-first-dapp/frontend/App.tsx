import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
 
function App() {
  return (
    <>
      <TopBanner />
      <Header />
      <div className="flex items-center justify-center flex-col">
        <div>My app goes here</div>
      </div>
    </>
  );
}
 
export default App;
 