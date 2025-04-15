import { Router } from "express";
import { BadRequestError, UnauthorizedError } from "../expressError";
import db from "../db";

const sessionRoutes = Router({ mergeParams: true });

/** GET / => { profile, households, inventories, ...supabaseSession }
 *
 * Returns
*  *
 * Authorization required: admin or same user-as-:id
 **/

sessionRoutes.get("/", async function (req, res, next) {
  try {
    let userSessionData = {
      profile: req?.context?.profile ?? null,
      households: req?.context?.households ?? null,
      inventories: req?.context?.inventories ?? null,
    };
    if (!!profile && !!profile?.draft_status === 'confirmed') {

      const [activeTasks, overDueTasks, newTasks, updatedTasks, completedTasks, newAssignments, updatedAssignments] = await Promise.all([
        //active tasks
        db.query(
          `SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
          JOIN ON tasks t ON t.id = ta.task_id 
          AND t.completion_status NOT IN ('completed', 'archived') 
          AND t.draft_status = 'confirmed'`,
          [req?.context?.user?.id]
        ),
        //overdue tasks
        db.query(
          `SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
          JOIN ON tasks t ON t.id = ta.task_id 
          AND t.due_date < NOW()
          AND t.completion_status NOT IN ('completed', 'archived')
          OR t.completion_status = 'overdue'
          AND t.draft_status = 'confirmed'`,
          [req?.context?.user?.id]
        ),
        //new tasks
        db.query(
          `SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
          JOIN ON tasks t ON t.id = ta.task_id
          AND t.CREATED_DT > NOW() - INTERVAL '1 DAY'
          AND t.completion_status NOT IN ('completed', 'archived')
          AND t.draft_status = 'confirmed'`,
          [req?.context?.user?.id]
        ),
        //updated tasks
        db.query(
          `SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
          JOIN ON tasks t ON t.id = ta.task_id
          AND t.updated_dt > NOW() - INTERVAL '1 DAY'
          AND t.completion_status NOT IN ('completed', 'archived')
          AND t.completion_status NOT IN ('completed', 'archived')
          AND t.draft_status = 'confirmed'
          ORDER BY t.updated_dt DESC
          `,

          [req?.context?.user?.id]
        ),
        //completed tasks
        db.query(
          `SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
          JOIN ON tasks t ON t.id = ta.task_id
          AND t.completion_status = 'completed'
          AND t.draft_status = 'confirmed'
          AND t.updated_dt > NOW() - INTERVAL '1 DAY'
          ORDER BY t.updated_dt DESC
          `, [req?.context?.user?.id]
        ),
        //new assignments
        db.query(
          `SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
          JOIN ON tasks t ON t.id = ta.task_id
          WHERE ta.created_at > NOW() - INTERVAL '1 DAY'
          AND ta.created_at != t.created_dt
          AND t.draft_status = 'confirmed'
          `, [req?.context?.user?.id]
        ),
        //updated assignments
        db.query(`
      SELECT ta.* FROM task_assignments WHERE ta.user_id = $1
      JOIN ON tasks t ON t.id = ta.task_id
      WHERE ta.updated_at > NOW() - INTERVAL '1 DAY'
      AND ta.created_at != t.created_dt
      AND t.draft_status = 'confirmed'
      `, [req?.context?.user?.id])
      ]);
      const activeTasksCount = activeTasks?.rows?.length ?? 0;
      const overdueTasksCount = overDueTasks?.rows?.length ?? 0;
      userSessionData = {
        ...userSessionData,
        tasks: {
          active: {
            count: activeTasksCount,
            data: activeTasks?.rows ?? [],
          },
          overdue: {
            count: overdueTasksCount,
            data: overDueTasks?.rows ?? [],
          },
        },
        task_assignments: {
          new: {
            count: newAssignments?.rows?.length ?? 0,
            data: newAssignments?.rows ?? [],
          },
          updated: {
            count: updatedAssignments?.rows?.length ?? 0,
            data: updatedAssignments?.rows ?? [],
          },
          completed: {
            count: completedTasks?.rows?.length ?? 0,
            data: completedTasks?.rows ?? [],
          },

        }
      };

    }


    if (Object.values(userSessionData).every((value) => value === null)) {
      throw new BadRequestError("No session data found");
    }
    return res.json(userSessionData, 200);
    // return res.json({ session });
  } catch (err) {
    return next(err);
  }
});


// Endpoint to get user statistics
statsRoute.post('/stats', async (req, res) => {
  const { household_id, user_id } = req.body;

  try {
    // Get household members count
    const { data: householdMembersData, error: householdMembersError } = await supabase
      .from('user_households')
      .select('user_id', { count: 'exact' })
      .eq('household_id', household_id)
      .neq('user_id', user_id);

    if (householdMembersError) throw householdMembersError;

    const householdMembers = householdMembersData.length;

    // Get tasks due count
    const { data: tasksDueData, error: tasksDueError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('assigned_to', user_id)
      .not('t.completion_status', 'in', ['completed', 'archived'])
      .eq('t.draft_status', 'confirmed');

    if (tasksDueError) throw tasksDueError;

    const tasksDue = tasksDueData.length;

    // Get inventories managed count
    const { data: inventoriesManagedData, error: inventoriesManagedError } = await supabase
      .from('inventories')
      .select('id', { count: 'exact' })
      .eq('household_id', household_id);

    if (inventoriesManagedError) throw inventoriesManagedError;

    const inventoriesManaged = inventoriesManagedData.length;

    // Get products count
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('household_id', household_id);

    if (productsError) throw productsError;

    const products = productsData.length;

    // Get vendors count
    const { data: vendorsData, error: vendorsError } = await supabase
      .from('vendors')
      .select('id', { count: 'exact' })
      .eq('household_id', household_id);

    if (vendorsError) throw vendorsError;

    const vendors = vendorsData.length;

    const relatedVendors = vendors; // Assuming related vendors are the same for simplicity

    const userStats = {
      householdMembers,
      tasksDue,
      inventoriesManaged,
      products,
      vendors,
      relatedVendors,
    };

    res.status(200).json(userStats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

