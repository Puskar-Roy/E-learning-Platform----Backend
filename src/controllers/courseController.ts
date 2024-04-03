import { Request, Response } from 'express';
import asyncHandler from '../util/catchAsync';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, category, level } = req.body;
    if (!title || !category || !level) {
      return res.status(400).json({ error: 'All fields must be filled' });
    }
    try {
      const newCourse = await prisma.course.create({
        data: { title, category, level },
      });
      return res.status(201).json(newCourse);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
);

export const getAllCourse = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const allCourses = await prisma.course.findMany();
      return res.status(200).json(allCourses);
    } catch (error) {
      console.error('Error getting all courses:', error);
      res.status(500).json({ error: 'Failed to get courses' });
    }
  }
);

export const getCourseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
      });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      console.error('Error getting course by ID:', error);
      res.status(500).json({ error: 'Failed to get course' });
    }
  }
);
export const updateCourseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, category, level } = req.body;
    try {
      const updatedCourse = await prisma.course.update({
        where: { id: parseInt(id) },
        data: { title, category, level },
      });
      res.json(updatedCourse);
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ error: 'Failed to update course' });
    }
  }
);

export const deleteCourseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deletedCourse = await prisma.course.delete({
        where: { id: parseInt(id) },
      });
      res.json(deletedCourse);
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }
);

export const enrollInCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { userId } = req.body;
    try {
      const enrollment = await prisma.userEnrollment.create({
        data: {
          userId: parseInt(userId, 10),
          courseId: parseInt(courseId, 10),
        },
      });
      res.status(201).json(enrollment);
    } catch (error) {
      console.error('Enroll in course error:', error.message);
      res
        .status(500)
        .json({ message: 'Unable to enroll in course', success: false });
    }
  }
);

export const leaveCourse = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { userId } = req.body;
  try {
    await prisma.userEnrollment.deleteMany({
      where: {
        userId: parseInt(userId, 10),
        courseId: parseInt(courseId, 10),
      },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Leave course error:', error.message);
    res.status(500).json({ message: 'Unable to leave course', success: false });
  }
});

export const trendingCourse = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const trendingCourses = await prisma.course.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          level: true,
          enrollments: {
            select: {
              createdAt: true,
            },
            where: {
              createdAt: {
                gte: startDate,
              },
            },
          },
        },
      });

      const trendingCoursesWithEnrollmentCount = trendingCourses.map(
        (course) => ({
          ...course,
          enrollmentCount: course.enrollments.length,
        })
      );

      const sortedCourses = trendingCoursesWithEnrollmentCount.sort(
        (a, b) => b.enrollmentCount - a.enrollmentCount
      );

      const topTrendingCourses = sortedCourses.slice(0, 5);

      res.json(topTrendingCourses);
    } catch (error) {
      console.error('Get trending courses error:', error.message);
      res
        .status(500)
        .json({ message: 'Unable to get trending courses', success: false });
    }
  }
);
