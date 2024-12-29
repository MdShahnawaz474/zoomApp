import { Link } from "react-router-dom";
import MobileImg from "../images/mobile.png"
import "../index.css"
const LandingPage = ()=>{

    return(
        <div className="LandingPageContainer">
           <nav>
            <div>
                <div className="navHeader">
                    <h2>Zoom App</h2>
                </div>
                
            </div>
            <div className="navlist">
                    <div>Join as Guest</div>
                    <p>Register</p>
                    <div role="button">
                        <p>Login</p>
                    </div>
                    </div>
           </nav>

           <div className="landingMainContainer">
            <div>
           <h2><span style={{color:"#FF9839"}}>Connect</span> with your loved once</h2>
           <p>Cover a distance by apna video call</p>
           <div role="button">
            <Link  className="btnGetStarted" to={"/auth "}>Get started
            </Link>
           </div>
            </div>
           
            <div>
                <img src={MobileImg} alt="Mobile-Img" />
            </div>
           </div>
        </div>
    )
}

export default LandingPage;