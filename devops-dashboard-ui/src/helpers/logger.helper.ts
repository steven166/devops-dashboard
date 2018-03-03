
import * as winston from "winston";

export function error(message: string, error?: any) {
  winston.error(message, error);
}
