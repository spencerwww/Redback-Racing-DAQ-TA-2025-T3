import { cn } from "@/lib/utils";

interface TemperatureProps {
  temp: any;
}

/**
 * Numeric component that displays the temperature value.
 * 
 * @param {number} props.temp - The temperature value to be displayed.
 * @returns {JSX.Element} The rendered Numeric component.
 */
function Numeric({ temp }: TemperatureProps) {
  // TODO: Change the color of the text based on the temperature
  // HINT:
  //  - Consider using cn() from the utils folder for conditional tailwind styling
  //  - (or) Use the div's style prop to change the colour
  //  - (or) other solution

  // Justify your choice of implementation in brainstorming.md

  const getTextColour = () => {
    if (temp > 80 || temp < 20) return "text-destructive"
    if (temp > 75 || temp < 25) return "text-warning"
    return "text-success"
  }

  return (
    <div className={
      cn(
        "text-4xl font-bold text-success",
        getTextColour()
      )
    }>
      {`${temp.toFixed(3)}°C`}
    </div>
  );
}

export default Numeric;
