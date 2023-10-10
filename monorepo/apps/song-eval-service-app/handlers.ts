import { APIGatewayEvent } from "aws-lambda";
import { songEvalService } from "@hoagie/song-eval-service";

export function test() {
  songEvalService();
}