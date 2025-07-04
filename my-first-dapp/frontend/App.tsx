import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { MODULE_ADDRESS } from "./constants";
import { aptosClient } from "./utils/aptosClient";
import { Button } from "./components/ui/button";
 
function App() {
  const { account, signAndSubmitTransaction } = useWallet();

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  const [accountHasList, setAccountHasList] = useState<boolean>(false); // State to track if the account has a todo list
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const moduleAddress = MODULE_ADDRESS; //smart contract address
  


  // Fetch the todo list for the connected account
  const fetchList = async () => {
    if (!account) return []; // If no account is connected, return an empty array

    try {
      // Attempt to get the TodoList resource for the connected account
      // If the resource exists, it means the account has a todo list
      const todoListResource = await aptosClient().getAccountResource(
        {
          accountAddress:account?.address,
          resourceType:`${moduleAddress}::todolist::TodoList`
        }
      );
      setAccountHasList(true);
    } catch (e: any) { // If it does not exist, an error will be thrown
      setAccountHasList(false);
    }
  };


  // Function to add a new todo list for the connected account
  const addNewList = async () => {
    if (!account) return [];
  
    const transaction:InputTransactionData = {
        data: {
          function:`${moduleAddress}::todolist::create_list`,
          functionArguments:[]
        }
      }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptosClient().waitForTransaction({transactionHash:response.hash});
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <>
      <TopBanner />
      <Header />
      <div className="flex items-center justify-center flex-col">
        {!accountHasList && (
          <div className="flex items-center justify-center flex-col">
            <Button
              onClick={addNewList}
              disabled={transactionInProgress}
            >
              Add new list
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
 
export default App;
 