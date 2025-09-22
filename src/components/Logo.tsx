import { FC } from "react";
import { Link } from "react-router-dom";

const Logo: FC = () => (
  <Link to="/">
    <img 
      src="/koa-logo.png" 
      alt="KOA Logo" 
      className="h-16 w-auto"
    />
  </Link>
);

export default Logo;