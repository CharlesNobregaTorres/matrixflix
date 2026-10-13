const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados em memória do servidor (com persistência simples)
let tempUsers = {
    "admin": { pass: "matrix93", expires: null } // Admin fixo sem expiração
};

// Rota para validar login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = tempUsers[username];

    if (!user) {
        return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
    }

    if (user.pass !== password) {
        return res.status(401).json({ success: false, message: 'Senha incorreta.' });
    }

    // Se tiver tempo de expiração configurado, verifica se já passou de 1 hora (3600000 ms)
    if (user.expires !== null) {
        const now = Date.now();
        if (now > user.expires) {
            delete tempUsers[username]; // Remove expirado
            return res.status(401).json({ success: false, message: 'Este acesso temporário expirou.' });
        }
    }

    res.json({ success: true, message: 'Login autorizado!' });
});

// Rota para gerar acesso de 1 hora
app.post('/api/generate', (req, res) => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tempUser = 'cliente_' + randomCode.toLowerCase();
    const tempPass = 'flix' + Math.floor(1000 + Math.random() * 9000);
    
    const now = Date.now();
    const oneHourLater = now + (60 * 60 * 1000); // 1 hora de validade

    tempUsers[tempUser] = {
        pass: tempPass,
        expires: oneHourLater
    };

    res.json({
        success: true,
        username: tempUser,
        password: tempPass,
        expiresAt: new Date(oneHourLater).toLocaleTimeString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CineFlix rodando na porta ${PORT}`);
});