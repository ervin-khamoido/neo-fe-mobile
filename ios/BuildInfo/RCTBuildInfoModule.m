//
//  RCTBuildInfoModule.m
//  Neobank
//
//  Created by Ihor on 15.12.22.
//

#import <Foundation/Foundation.h>


#import "RCTBuildInfoModule.h"

@implementation RCTBuildInfoModule

RCT_EXPORT_MODULE(BuildInfoModule);

RCT_EXPORT_METHOD(getAll:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  NSDictionary *value = [[[NSBundle mainBundle] infoDictionary] valueForKey:@"custom_env_variables"];

  resolve(value);
}

@end
