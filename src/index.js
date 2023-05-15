import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

let users = [];

function validId(req, res, next) {
    const userId = parseInt(req.params.id);
    console.log('userId:', userId);
    const validUser = users.find(user => user.id === userId);

    if (validUser) {
        console.log('validUser:', validUser);
        next();
    } else {
        console.log('User not found');
        return res.status(400).send("Usuário não encontrado ou não existe");
    }
}

//REGISTRAR USUARIO
app.post('/register', (req, res) => {
    const { nome, email, password } = req.body;
    const userExist = users.find(newUser => newUser.email === email);

    if (userExist) {
        return res.status(401).send("Email já registrado por outro usuário");
    } else {
        const rounds = 10
        const id = users.length + 1;
        try{
            const bcryptPassword = bcrypt.hashSync(password, rounds);
            const newUser = {
                id,
                nome,
                email,
                password: bcryptPassword,
                notes: []
            };

            users.push(newUser);
            console.log('newUser:', newUser);
            return res.status(200).send("Conta criada com SUCESSO!");
        }catch(error){
            console.log(error)
        }
    }
});

//LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).send("Usuário não encontrado ou não existe");
    }
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch || user.email !== email) {
        return res.status(401).send("Email ou senha incorretos");
    }
    res.status(200).send("Login bem-sucedido");
});

//LER USUARIOS
app.get('/users', (req, res) => {
    res.status(200).send(users)
})

// CRIAR RECADOS
app.post('/users/:id/note', validId, (req, res) => {
    const { title, description } = req.body;
    const id = parseInt(req.params.id);
    console.log('id:', id);
    const user = users.find(user => user.id === id);
    console.log('user:', user);
    
    if (!user){
        return res.status(400).send("Usuário não encontrado");
    }

    const newId = user.notes.length + 1;
    const newNote = {
        id: newId,
        title: title,
        description: description,
    };
    user.notes.push(newNote);
    res.status(200).send("Nota criada com sucesso!");
});

//EDITAR RECADOS
app.put('/users/:id/note/:newId', validId, (req, res) => {
    const id = parseInt(req.params.id);
    const newId = parseInt(req.params.newId);
    const { title, description } = req.body;

    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(400).send('Usuário não encontrado');
    }
    
    const note = user.notes.find(note => note.id === newId);
    if (!note) {
        return res.status(400).send('Nota não encontrada');
    }

    note.title = title;
    note.description = description;

    res.status(200).send('Nota atualizada com sucesso!');
});



//LER RECADOS
app.get('/users/:id/note', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id === id);

    res.status(200).send(user.notes);
})

//DELETAR RECADO
app.delete('/users/:id/note/:newId', validId, (req, res) => {
    const id = parseInt(req.params.id);
    const newId = parseInt(req.params.newId);

    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(400).send('Usuário não encontrado');
    }

    const noteIndex = user.notes.findIndex(note => note.id === newId);
    if (noteIndex === -1) {
        return res.status(400).send('Nota não encontrada');
    }
    user.notes.splice(noteIndex, 1);
    res.status(200).send('Nota deletada com sucesso!');
});



app.listen(4040, () => console.log("Servidor iniciado: http://localhost:4040/"));