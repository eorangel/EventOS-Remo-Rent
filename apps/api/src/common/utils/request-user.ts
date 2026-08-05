import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../utils/user-context';

export function getAuthUser(req: Request): AuthUser {
  return req.user as AuthUser;
}
