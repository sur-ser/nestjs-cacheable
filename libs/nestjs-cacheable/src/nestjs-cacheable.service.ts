import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { CACHEABLE } from './constants'
import { Cacheable } from 'cacheable'
import { Keyv } from 'keyv'
import { WrapFunctionOptions } from './interfaces/cacheable-options.interface'

@Injectable()
export class NestjsCacheableService implements OnModuleDestroy {
  private readonly logger = new Logger(NestjsCacheableService.name)

  constructor(@Inject(CACHEABLE) private readonly cache: Cacheable) {}

  async onModuleDestroy() {
    await this.disconnect()
  }

  get primary(): Keyv {
    return this.cache.primary
  }

  get secondary(): Keyv | undefined {
    return this.cache.secondary
  }

  async disconnect() {
    await this.cache.disconnect()
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key)
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      this.logger.log(`Setting cache for key: ${key}, value: ${JSON.stringify(value)}, ttl: ${ttl}`)
    } catch {
      this.logger.log(`Setting cache for key: ${key}, value: [unserializable], ttl: ${ttl}`)
    }
    if (ttl !== undefined) {
      await this.cache.set(key, value, ttl)
    } else {
      await this.cache.set(key, value)
    }
    return true
  }

  async del(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  wrap<T, Arguments extends any[]>(
    fn: (...args: Arguments) => Promise<T>,
    options?: WrapFunctionOptions,
  ): (...args: Arguments) => Promise<T> {
    const wrappedFn = this.cache.wrap(fn, options)
    return wrappedFn
  }
}
