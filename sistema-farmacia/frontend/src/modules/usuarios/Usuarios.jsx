import {useState, React} from 'react'


function Usuarios() {
    
    const [usuarios, setUsuarios] = useState([]);
    
    return (
        <>
            <div>
                <h1>Usuarios</h1>
            </div>
            <section>
                <table>
                    <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                    </tr>
                    </thead>


                </table>
            </section>
        </>
    );
}

module.exports = Login;