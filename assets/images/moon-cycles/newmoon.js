import Svg, { Circle } from "react-native-svg";

const SvgComponent = (props) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <Circle cx="32" cy="32" r="30" fill="#050c1dff" />
  </Svg>
);
export default SvgComponent;