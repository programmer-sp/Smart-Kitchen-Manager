/* eslint-disable no-async-promise-executor */
import Container from "typedi";
import { REDIS_EXPIRE_TIME } from "../utils/Constants";
import { isJson } from './Helper';

class SetRedisDTO {
    key: string;
    value: string | boolean | object;
    duration: number;
    expireIn?: string = REDIS_EXPIRE_TIME.MILLISECONDS;
}

class GetRedisValueDTO {
    key: string;
    jsonify?: boolean = true;
}

class DeleteRedisKeyDTO {
    key: string | Array<string>;
}

class CommonRedisKeysDTO {
    key: string;
}

class CustomPatternValueDTO {
    key: string;
    keys?: string;
}

const getValue = async ({ key, jsonify = true }: GetRedisValueDTO) => {
    const redis = Container.get('redis') as any;
    return new Promise(async (resolve, reject) => {
        await redis.get(key).then((data: any) => {
            if (jsonify) return resolve(JSON.parse(data));
            else return resolve(data);
        }).catch((error: any) => {
            return reject(error);
        });
    });
};

const setValue = async ({ key, value, duration, expireIn = REDIS_EXPIRE_TIME.MILLISECONDS }: SetRedisDTO) => {
    const redis = Container.get('redis') as any;
    return new Promise(async (resolve, reject) => {
        if (duration < 0) {
            await redis.set(key, JSON.stringify(value)).then((data: any) => {
                return resolve(data);
            }).catch((error: any) => {
                return reject(error);
            });
        } else {
            await redis.set(key, JSON.stringify(value), expireIn, duration,
            ).then(async (data: any) => {
                await redis.expire(key, +duration / 1000).catch((err: any) => reject(err))
                return resolve(data);
            }).catch((error: any) => {
                return reject(error);
            });
        }
    });
};

const existKeys = async ({ key }: CommonRedisKeysDTO) => {
    const redis: any = Container.get('redis');
    return new Promise(async (resolve, reject) => {
        await redis.exists(key).then((data: any) => {
            return resolve(data);
        }).catch((error: any) => {
            return reject(error);
        });
    });
};

const getTTLOfKey = async ({ key }: CommonRedisKeysDTO) => {
    const redis: any = Container.get('redis');
    return new Promise(async (resolve, reject) => {
        await redis.ttl(key).then((data: any) => {
            return resolve(data);
        }).catch((error: any) => {
            return reject(error);
        });
    });
};

const getAllKeys = async ({ key }: CustomPatternValueDTO) => {
    key = key ? `*${key}*` : `*`;
    const redis = Container.get('redis') as any;
    return new Promise(async (resolve, reject) => {
        await redis.keys(key).then((data: any) => {
            return resolve(data);
        }).catch((error: any) => {
            return reject(error);
        });
    });
};

const deleteKey = async ({ key }: DeleteRedisKeyDTO) => {
    const redis = Container.get('redis') as any;
    return new Promise(async (resolve, reject) => {
        await redis.del(key).then((data: any) => {
            return resolve(data);
        }).catch((error: any) => {
            return reject(error);
        });
    });
};

const getValueByPattern = async ({ key, keys = (key ? `*${key}*` : `*`) }: CustomPatternValueDTO) => {
    const redis = Container.get('redis') as any;
    return new Promise(async (resolve, reject) => {
        await redis.keys(keys).then(async (data: any) => {
            const keyData = [];
            for (const val of data) {
                let valData = await redis.get(val);
                if (valData && await isJson(valData)) valData = JSON.parse(valData);
                keyData.push({ [val]: valData });
            }
            return resolve({ count: data.length, data: keyData });
        }).catch((error: any) => {
            return reject(error);
        });
    });
};

const delKeyByPattern = async ({ key, keys = (key ? `*${key}*` : `*`) }: CustomPatternValueDTO) => {
    const redis = Container.get('redis') as any;
    return new Promise(async (resolve, reject) => {
        await redis.keys(keys).then(async (data: any) => {
            await redis.del(data);
            return resolve(true);
        }).catch((error: any) => {
            return reject(error);
        });
    });
};

const flushallKeys = async ({ key, keys = (key ? `*${key}*` : `*`) }: CustomPatternValueDTO) => {
    const redis = Container.get('redis') as any;
    return new Promise(async (resolve, reject) => {
        try {
            if (!key) await redis.sendCommand(['FLUSHALL']);
            else {
                const edx_inv_keys = await redis.keys(keys);
                for (let i = 15; i >= 0; i--) {
                    const isSelected = await redis.sendCommand(['SELECT', `${i}`]);
                    if (isSelected) {
                        const isCleaned = await redis.sendCommand(['FLUSHDB']);
                        if (isCleaned && i === 15 && edx_inv_keys.length) {
                            await redis.sendCommand(['SELECT', `${0}`]);
                            for (const val of edx_inv_keys) await redis.move(val, i);
                        }
                        if (i === 0) {
                            await redis.sendCommand(['SELECT', `${i}`]);
                            await redis.swapDb(15, i);
                        }
                    }
                }
            }
            return resolve(true);
        } catch (e) {
            return reject(e);
        }
    });
};

export const redis = {
    getValue,
    setValue,
    existKeys,
    getTTLOfKey,
    getAllKeys,
    deleteKey,
    getValueByPattern,
    delKeyByPattern,
    flushallKeys
};