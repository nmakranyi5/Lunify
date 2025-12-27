import Svg, { Circle, Path } from "react-native-svg";

const SvgComponent = (props) => (
  <Svg viewBox="0 0 64 64" {...props}>
    <Circle cx="32" cy="32" r="30" fill="#050c1dff" />
    <Path 
      d="M32 2C15.432 2 2 15.432 2 32s13.432 30 30 30c-9-10-12-25-12-30s3-20 12-30z" 
      fill="rgba(239, 234, 234, 0.85)"
    />
  </Svg>
);
export default SvgComponent;