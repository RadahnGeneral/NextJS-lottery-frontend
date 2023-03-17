import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import React, { useEffect } from "react";
import { errors, ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const { chainId: chainidHex, isWeb3Enabled } = useMoralis();
  const chainID = parseInt(chainidHex);
  const lotteryAddress =
    chainID in contractAddresses ? contractAddresses[chainID][0] : null;

  const [entranceFee, setEntranceFee] = React.useState("0");
  const [NumPlayers, setNumPlayers] = React.useState("0");
  const [RecentWinner, setRecentWinner] = React.useState("0");

  const dispatch = useNotification();

  const {
    runContractFunction: enterLottery,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberofPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberofPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  // async function updateUIValues() {
  //   const entranceFeeFromCall = await getEntranceFee();
  //   console.log(entranceFeeFromCall);
  // }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled]);

  async function updateUIValues() {
    const entranceFeeFromContract = (await getEntranceFee()).toString();
    setEntranceFee(entranceFeeFromContract);

    const numPlayersFromContract = (await getNumberofPlayers()).toString();
    setNumPlayers(numPlayersFromContract);

    const recentWinnerFromContract = (await getRecentWinner()).toString();
    setRecentWinner(recentWinnerFromContract);
  }

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUIValues();
  };

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notifiaction",
      position: "topR",
      icon: "bell",
    });
  };

  // useEffect(() => {
  //   if (isWeb3Enabled) {
  //     async function updateUI() {
  //       const No_Words = await getNumWords();
  //       console.log(No_Words);
  //     }
  //     updateUI();
  //   }
  // }, [isWeb3Enabled]);

  return (
    <div className="p-5">
      {lotteryAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async () =>
              await enterLottery({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Lottery!</div>
            )}
          </button>
          <div>
            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}
          </div>
          <div> Number of Players: {NumPlayers}</div>
          <div>RecentWinner: {RecentWinner}</div>
        </div>
      ) : (
        <div> No Lottery Addressed Detected </div>
      )}
    </div>
  );
}
