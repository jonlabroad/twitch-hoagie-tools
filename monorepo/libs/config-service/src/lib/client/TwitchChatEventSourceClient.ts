import { DescribeServicesCommand, ECSClient } from "@aws-sdk/client-ecs";
import { ConfigServiceConfig } from "../ConfigServiceConfig";

export type ChatEventServiceStatus = "running" | "stopped"

const ecs = new ECSClient({ region: "us-east-1" });

export class TwitchChatEventSourceClient {
    public static async getServiceStatus() {
        const serviceDescription = await TwitchChatEventSourceClient.getServiceDescription();
        if (!serviceDescription) {
            return {
                isRunning: false,
                isEnabled: false,
                pendingCount: 0,
                runningCount: 0,
                status: "UNKNOWN",
                statusMessage: "Service not found",
            }
        }

        const isEnabled = (serviceDescription?.desiredCount ?? 0) >= 1;
        const pendingCount = serviceDescription?.pendingCount ?? 0;
        const runningCount = serviceDescription?.runningCount ?? 0;
        const status = serviceDescription?.status ?? "UNKNOWN"; // ACTIVE, DRAINING, INACTIVE

        const isRunning = isEnabled && status === "ACTIVE" && serviceDescription?.deployments?.[0]?.status === "PRIMARY";
        return {
            isRunning,
            isEnabled,
            pendingCount,
            runningCount,
            status,
            statusMessage: isRunning ? "Service is running" : "Service is not running",
        }
    }

    public static async getServiceDescription() {
        const describeServices = await ecs.send(new DescribeServicesCommand({
            cluster: ConfigServiceConfig.ChatEventSource.clusterName,
            services: [ConfigServiceConfig.ChatEventSource.serviceName],
        }));

        const serviceDescription = describeServices?.services?.[0];
        return serviceDescription;
    }
}
