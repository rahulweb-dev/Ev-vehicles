import RangeCalculatorClient from "./RangeCalculatorClient";

export const metadata = {
  title: "EV Range Calculator India – How Far Can Your Electric Car Go?",
  description: "Calculate real-world EV range based on driving style, AC usage, speed, and weather. Find your electric vehicle's actual range in Indian conditions.",
};

export default function RangeCalculatorPage() {
  return <RangeCalculatorClient />;
}
