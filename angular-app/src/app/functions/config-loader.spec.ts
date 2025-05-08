import { loadConfig } from './config-loader'
import { of, throwError } from 'rxjs';
import { EnvironmentService } from '../services/environment.service';
import { ConfigService } from '../services/config.service';

describe('loadConfig', () => {
  let mockEnvService: jasmine.SpyObj<EnvironmentService>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    mockEnvService = jasmine.createSpyObj('EnvironmentService', ['getEnvVars']);
    mockConfigService = jasmine.createSpyObj('ConfigService', ['setConfig']);
  });

  it('should load config and call setConfig on success', async () => {
    const fakeEnv = { apiUrl: 'https://example.com' };
    mockEnvService.getEnvVars.and.returnValue(of(fakeEnv));

    const initFunction = loadConfig(mockEnvService, mockConfigService);

    await initFunction();

    expect(mockEnvService.getEnvVars).toHaveBeenCalled();
    expect(mockConfigService.setConfig).toHaveBeenCalledWith(fakeEnv);
  });

  it('should reject with an error message on failure', async () => {
    mockEnvService.getEnvVars.and.returnValue(throwError(() => new Error('env error')));

    const initFunction = loadConfig(mockEnvService, mockConfigService);

    await expectAsync(initFunction()).toBeRejectedWith(
      'Failed to load environment configuration: Error: env error'
    );

    expect(mockConfigService.setConfig).not.toHaveBeenCalled();
  });
});
