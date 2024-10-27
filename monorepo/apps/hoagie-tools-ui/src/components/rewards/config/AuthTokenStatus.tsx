import { TokenCategory } from "@hoagie/api-util";
import { FlexRow } from "../../util/FlexBox";
import VerifiedIcon from "@mui/icons-material/Verified";
import { ValidationResult } from "@hoagie/config-service";
import { CircularProgress } from "@mui/material";

interface IProps {
  tokenType: TokenCategory;
  token: ValidationResult | undefined;
  requiredScopes: string[];
  isLoading: boolean;
}

export const AuthTokenStatus = (props: IProps) => {
  if (props.isLoading) {
    return <CircularProgress />
  }

  return <>
    {props.requiredScopes.map((requiredScope) => {
      return (
        <FlexRow>
          <div key={`${requiredScope}`} style={{ marginRight: 10 }}>
            {props.token?.isValid ? (
              <VerifiedIcon />
            ) : (
              <div>-</div>
            )}
          </div>
          <div>{requiredScope}</div>
        </FlexRow>
      )})
  }
  </>
}
