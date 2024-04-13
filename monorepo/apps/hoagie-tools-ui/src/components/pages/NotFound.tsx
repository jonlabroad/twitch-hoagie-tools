import { Grid } from "@mui/material";
import { FlexRow } from "../util/FlexBox";

export const NotFound = () => {
  return (
    <Grid container>
      <Grid item xs={12} marginTop={3} marginBottom={3}>
        <FlexRow justifyContent="center">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/IynB96gtqk0?si=sQHA_96lacb0a8YO"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </FlexRow>
      </Grid>
      <Grid item xs={12}>
        <FlexRow justifyContent="center">Well hi!</FlexRow>
      </Grid>
    </Grid>
  );
};
