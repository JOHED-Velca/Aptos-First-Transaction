import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { MODULE_ADDRESS } from "./constants";
import { aptosClient } from "./utils/aptosClient";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

type Task = {
  address: string;
  completed: boolean;
  content: string;
  task_id: string;
};
 
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

      // tasks table handle
      const tableHandle = (todoListResource as any).tasks.handle;
      // tasks table counter
      const taskCounter = (todoListResource as any).task_counter;
  
      let tasks = []; 
      let counter = 1;
      while (counter <= taskCounter) { // Loop through the tasks based on the counter
        const tableItem = { 
          key_type: "u64",
          value_type: `${moduleAddress}::todolist::Task`,
          key: `${counter}`,
        };
        // Fetch each task from the table using the handle and item key
        const task = await aptosClient().getTableItem<Task>({handle:tableHandle, data:tableItem});
        tasks.push(task); // Add the fetched task to the tasks array
        counter++;
      }
      // set tasks in local state
      setTasks(tasks);
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
        {!accountHasList ? (
            <Button
              onClick={addNewList}
              disabled={transactionInProgress}
            >
              Add new list
            </Button>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="flex flex-row gap-10">
              <Input/>
              <Button>Add new task</Button>
            </div>
            {tasks &&
              tasks.length > 0 &&
              tasks.map((task) => (
                <div key={task.task_id} className="flex justify-between flex-row">
                  <p className="text-xl font-bold">{task.content}</p>
                  <div>
                    <Input type="checkbox"/>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
 
export default App;
 