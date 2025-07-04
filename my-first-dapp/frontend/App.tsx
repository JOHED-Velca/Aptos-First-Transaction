import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { MODULE_ADDRESS } from "./constants";
import { aptosClient } from "./utils/aptosClient";
 
function App() {
  const { account } = useWallet();

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  const [accountHasList, setAccountHasList] = useState<boolean>(false);

  const fetchList = async () => {
    if (!account) return [];
    const moduleAddress = MODULE_ADDRESS;
    
    try {
      const todoListResource = await aptosClient().getAccountResource(
        {
          accountAddress:account?.address,
          resourceType:`${moduleAddress}::todolist::TodoList`
        }
      );
      setAccountHasList(true);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };

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
 