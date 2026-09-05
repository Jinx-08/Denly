
const supabase = require('../supabase/client');

// Landing-page impact counters. Six plain head-counts — cheap at this scale
// and independent of any view existing in the DB.
exports.getPublicStats = async (req, res) => {
    try {
        const [
            totalPets, petsAdopted, petsAvailable,
            totalPartners, totalAppointments, approvedApplications,
        ] = await Promise.all([
            supabase.from('pets').select('*', { count: 'exact', head: true }),
            supabase.from('pets').select('*', { count: 'exact', head: true }).eq('status', 'adopted'),
            supabase.from('pets').select('*', { count: 'exact', head: true }).eq('status', 'available'),
            supabase.from('partners').select('*', { count: 'exact', head: true }),
            supabase.from('appointments').select('*', { count: 'exact', head: true }),
            supabase.from('adoption_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        ]);

        const counts = [totalPets, petsAdopted, petsAvailable, totalPartners, totalAppointments, approvedApplications];
        if (counts.some((r) => r.error)) {
            counts.filter((r) => r.error).forEach((r) => console.error('Error fetching stats:', r.error));
            return res.status(500).json({ error: 'Error fetching stats' });
        }

        return res.status(200).json({
            totalPets: totalPets.count,
            petsAdopted: petsAdopted.count,
            petsAvailable: petsAvailable.count,
            totalPartners: totalPartners.count,
            totalAppointments: totalAppointments.count,
            approvedApplications: approvedApplications.count,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
};
