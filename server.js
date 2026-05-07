const http = require('http');

const PORT = 3000;

let students = [];

// Email validation
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Send JSON response
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {

    const method = req.method;
    const urlParts = req.url.split('/');

    // ================= GET ALL STUDENTS =================

    if (req.url === '/students' && method === 'GET') {

        return sendResponse(res, 200, {
            success: true,
            data: students
        });
    }

    // ================= GET SINGLE STUDENT =================

    if (urlParts[1] === 'students' && urlParts[2] && method === 'GET') {

        const student = students.find(s => s.id === urlParts[2]);

        if (!student) {
            return sendResponse(res, 404, {
                success: false,
                message: 'Student not found'
            });
        }

        return sendResponse(res, 200, {
            success: true,
            data: student
        });
    }

    // ================= CREATE STUDENT =================

    if (req.url === '/students' && method === 'POST') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const data = JSON.parse(body);

            const { name, email, course, year } = data;

            // Validation
            if (!name || !email || !course || !year) {

                return sendResponse(res, 400, {
                    success: false,
                    message: 'All fields are required'
                });
            }

            if (!isValidEmail(email)) {

                return sendResponse(res, 400, {
                    success: false,
                    message: 'Invalid email'
                });
            }

            if (year < 1 || year > 4) {

                return sendResponse(res, 400, {
                    success: false,
                    message: 'Year must be between 1 and 4'
                });
            }

            const newStudent = {
                id: Date.now().toString(),
                name,
                email,
                course,
                year
            };

            students.push(newStudent);

            return sendResponse(res, 201, {
                success: true,
                message: 'Student created',
                data: newStudent
            });
        });

        return;
    }

    // ================= UPDATE STUDENT =================

    if (urlParts[1] === 'students' && urlParts[2] && method === 'PUT') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const studentIndex = students.findIndex(
                s => s.id === urlParts[2]
            );

            if (studentIndex === -1) {

                return sendResponse(res, 404, {
                    success: false,
                    message: 'Student not found'
                });
            }

            const updatedData = JSON.parse(body);

            students[studentIndex] = {
                ...students[studentIndex],
                ...updatedData
            };

            return sendResponse(res, 200, {
                success: true,
                message: 'Student updated',
                data: students[studentIndex]
            });
        });

        return;
    }

    // ================= DELETE STUDENT =================

    if (urlParts[1] === 'students' && urlParts[2] && method === 'DELETE') {

        const studentIndex = students.findIndex(
            s => s.id === urlParts[2]
        );

        if (studentIndex === -1) {

            return sendResponse(res, 404, {
                success: false,
                message: 'Student not found'
            });
        }

        students.splice(studentIndex, 1);

        return sendResponse(res, 200, {
            success: true,
            message: 'Student deleted'
        });
    }

    // ================= INVALID ROUTE =================

    return sendResponse(res, 404, {
        success: false,
        message: 'Route not found'
    });

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});