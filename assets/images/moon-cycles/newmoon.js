import Svg, { Circle } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={800}
    height={800}
    aria-hidden="true"
    className="iconify iconify--emojione-monotone"
    viewBox="0 0 64 64"
    {...props}
  >
    <Circle cx={32} cy={32} r={30} />
  </Svg>
)
export default SvgComponent
