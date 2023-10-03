import { Navigate, generatePath, useParams } from "react-router"

export const Redirect = (props: { to: string }) => {
    const params = useParams();
    const path = generatePath(props.to, params)
    
    return <Navigate to={path} replace/>
}