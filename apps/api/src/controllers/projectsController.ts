import type { NextFunction, Request, Response } from 'express';
import {
  createProjectSchema,
  updateProjectSchema,
} from '@notos/shared';
import {
  createProjectForUser,
  deleteProjectForUser,
  listProjects,
  updateProjectForUser,
} from '../services/projects.js';
import { sendError, sendSuccess } from '../lib/apiResponse.js';
import { getRouteParam } from '../lib/requestParams.js';
import { isUniqueViolationCode, SupabaseOperationError } from '../lib/supabase/errors.js';

export async function getProjectsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const projects = await listProjects(req.supabase);
    sendSuccess(res, projects);
  } catch (error) {
    next(error);
  }
}

export async function createProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase || !req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const parsed = createProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid request', 422);
      return;
    }

    const project = await createProjectForUser(
      req.supabase,
      req.user.id,
      parsed.data.id,
      parsed.data.name
    );
    sendSuccess(res, project, 201);
  } catch (error) {
    if (error instanceof SupabaseOperationError && isUniqueViolationCode(error.code)) {
      sendError(res, 'Resource already exists', 409);
      return;
    }

    next(error);
  }
}

export async function updateProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const parsed = updateProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid request', 422);
      return;
    }

    const projectId = getRouteParam(req.params.id);

    if (!projectId) {
      sendError(res, 'Project id is required', 422);
      return;
    }

    if (parsed.data.deleted_at !== undefined) {
      const project = await deleteProjectForUser(req.supabase, projectId);
      sendSuccess(res, project);
      return;
    }

    if (!parsed.data.name) {
      sendError(res, 'Name is required', 422);
      return;
    }

    const project = await updateProjectForUser(req.supabase, projectId, {
      name: parsed.data.name,
    });
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
}
