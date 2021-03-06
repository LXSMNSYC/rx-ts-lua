/**
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2020
 */
import { LuaFunction } from '../../types/utils';
import Single, { SingleTransformer } from '../../single';
import { SingleObserver } from '../../types/observers';
import Subscription from '../../types/subscription';

class SingleMapObserver<T, R> implements SingleObserver<T> {
  private upstream: SingleObserver<R>;

  private mapper: LuaFunction<T, R>;

  constructor(upstream: SingleObserver<R>, mapper: LuaFunction<T, R>) {
    this.upstream = upstream;
    this.mapper = mapper;
  }

  public onSubscribe(subscription: Subscription): void {
    this.upstream.onSubscribe(subscription);
  }

  public onSuccess(value: T): void {
    let result;
    try {
      result = this.mapper(value);
    } catch (err) {
      this.onError(err);
      return;
    }
    this.upstream.onSuccess(result);
  }

  public onError(value: any): void {
    this.upstream.onError(value);
  }
}

class SingleMap<T, R> extends Single<R> {
  private source: Single<T>;

  private mapper: LuaFunction<T, R>;

  constructor(source: Single<T>, mapper: LuaFunction<T, R>) {
    super();
    this.source = source;
    this.mapper = mapper;
  }

  protected subscribeActual(observer: SingleObserver<R>): void {
    this.source.subscribe(
      new SingleMapObserver<T, R>(observer, this.mapper),
    );
  }
}

export default function map<T, R>(this: void, mapper: LuaFunction<T, R>): SingleTransformer<T, R> {
  return (value: Single<T>): Single<R> => new SingleMap<T, R>(value, mapper);
}
