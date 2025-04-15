// import supabase from "../lib/supabase";
// import { Router } from "express";

// const statsRoute = Router({ mergeParams: true });

// // Endpoint to get user statistics
// statsRoute.post('/stats', async (req, res) => {
//     const { household_id, user_id } = req.body;

//     try {
//         // Get household members count
//         const { data: householdMembersData, error: householdMembersError } = await supabase
//             .from('user_households')
//             .select('user_id', { count: 'exact' })
//             .eq('household_id', household_id)
//             .neq('user_id', user_id);

//         if (householdMembersError) throw householdMembersError;

//         const householdMembers = householdMembersData.length;

//         // Get tasks due count
//         const { data: tasksDueData, error: tasksDueError } = await supabase
//             .from('tasks')
//             .select('id', { count: 'exact' })
//             .eq('assigned_to', user_id)
//             .not('completion_status', 'in', ['completed', 'archived'])
//             .eq('draft_status', 'confirmed');

//         if (tasksDueError) throw tasksDueError;

//         const tasksDue = tasksDueData.length;

//         // Get inventories managed count
//         const { data: inventoriesManagedData, error: inventoriesManagedError } = await supabase
//             .from('inventories')
//             .select('id', { count: 'exact' })
//             .eq('household_id', household_id);

//         if (inventoriesManagedError) throw inventoriesManagedError;

//         const inventoriesManaged = inventoriesManagedData.length;

//         // Get products count
//         const { data: productsData, error: productsError } = await supabase
//             .from('products')
//             .select('id', { count: 'exact' })
//             .eq('household_id', household_id);

//         if (productsError) throw productsError;

//         const products = productsData.length;

//         // Get vendors count
//         const { data: vendorsData, error: vendorsError } = await supabase
//             .from('vendors')
//             .select('id', { count: 'exact' })
//             .eq('household_id', household_id);

//         if (vendorsError) throw vendorsError;

//         const vendors = vendorsData.length;

//         const relatedVendors = vendors; // Assuming related vendors are the same for simplicity

//         const userStats = {
//             householdMembers,
//             tasksDue,
//             inventoriesManaged,
//             products,
//             vendors,
//             relatedVendors,
//         };

//         res.status(200).json(userStats);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

