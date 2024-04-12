import axios from "axios";
import { useEffect, useState } from "react";

export const Balance = ({ value }) => {
  const [balance, setBalance] = useState(0);
  const [details, setDetails] = useState({});

  	useEffect(() => {
		const token = localStorage.getItem("token");
		console.log(token);

		axios({
			method: "get",
			url: `http://localhost:3000/api/v1/account/balance`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((response) => {
				if (response.statusText) {
					setBalance(response.data.balance);
				}
			})
			.catch((err) => console.log(err));
	}, []);
  return (
    <div className="flex">
      <div className="font-bold text-lg">Your Balance :</div>
      <div className="font-semibold ml-4 text-lg">
        ₹{Math.floor(balance).toFixed(2)}
      </div>
    </div>
  );
};
