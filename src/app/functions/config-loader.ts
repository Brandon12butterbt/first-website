import { EnvironmentService } from '../services/environment.service';
import { ConfigService } from '../services/config.service';

export function loadConfig(
  envService: EnvironmentService,
  configService: ConfigService
): () => Promise<void> {
  return () =>
    envService
      .getEnvVars()
      .toPromise()
      .then((env) => {
        configService.setConfig(env);
      })
      .catch((err) => {
        return Promise.reject('Failed to load environment configuration: ' + err);
      });
}
