import React, { useEffect, useRef } from "react";
import axios from "axios";


const TradingViewWidget = () => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    // Ensure the TradingView library is available
    if (window.TradingView && chartContainerRef.current) {
      new window.TradingView.widget({
        container_id: chartContainerRef.current.id,
        symbol: "BTCUSD", // Change this to your desired trading pair or asset
        interval: "5", // Timeframe (e.g., "1", "5", "15", "60", "D")
        theme: "dark", // "light" or "dark"
        style: "1", // Chart style
        locale: "en", // Language
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        save_image: false,
        studies: [],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
      });
    }

    // Load the backend data
    // const getData=async()=>{
    //   const result=await axios.get("/get")
    //   console.log(result.data);
    // }
    // getData()
    // // const result=axios.get("/get")
    // // console.log(result);
    // const postData=async()=>{
    //   const result=await axios.post("/post", {
    //     name: "John",
    //     age: 30,
    //   });
    //   console.log(result);
      
    // }
    // postData()
    
  }, []);

  return (
    <>
    
     <div className="flex h-100% bg-gray-100 p-4">
      
      {/* Left Panel */}
      <div className="w-1/4 bg-white p-4 rounded-lg shadow-md">
        <h5 className="text-2xl font-bold ">Twitter Sentiment</h5>
        <ul>
            <li className="text-lg mt-2">🚀 Bitcoin is pumping!</li>
            <li className="text-lg">📈 Big move incoming!</li>
            <li className="text-lg">🐋 Whales are accumulating!</li>
        </ul>
      </div>

      
    
      <div
        ref={chartContainerRef}
        id="tradingview-chart"
        style={{ height: "500px", width: "100%" }}
      ></div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600">
          Buy
        </button>
        <button className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600">
          Sell
        </button>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Analyze
        </button>
      </div>

     </div>
    </>
  );
};

export default TradingViewWidget;
