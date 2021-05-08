package com.uniovi.tests;
//Paquetes Java
import java.util.List;
import java.util.Random;

//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;


//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class SdiEntrega2Tests {
	//En Windows (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens automÃ¡ticas)):
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "C:\\geckodriver024win64.exe";
	//ComÃºn a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024); 
	static String URL = "https://localhost:8081";
	

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}


	@Before
	public void setUp(){
		driver.navigate().to(URL);
	}
	@After
	public void tearDown(){
		driver.manage().deleteAllCookies();
	}
	@BeforeClass 
	static public void begin() {
		//COnfiguramos las pruebas.
		//Fijamos el timeout en cada opciÃ³n de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}
	@AfterClass
	static public void end() {
		//Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	//PR01. Registro de usuario con datos validos/
	@Test
	public void PR01() {
		String email = "candela" + Math.random()*6 +"@gmail.com";
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));	
		PO_PrivateView.logout(driver);	
		PO_View.checkElement(driver, "text", "Identificación de usuario");
			
	}

	//PR02. Registro de Usuario con datos inválidos (email, nombre y apellidos vacíos)./
	@Test
	public void PR02() {
		PO_PrivateView.signup(driver, "", "", "", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));					
	}

	//PR03. Registro de Usuario con datos inválidos (repetición de contraseña inválida) /
	@Test
	public void PR03() {
		PO_PrivateView.signup(driver, "candelabj00@gmail.com", "Candela", "Bobes", "12345", "12345865736");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));		
		assertNotNull(PO_View.checkElement(driver, "text", "La contraseña no coincide"));
	}
	
	//PR04. Registro de Usuario con datos inválidos (email existente). /
	@Test
	public void PR04() {
		PO_PrivateView.signup(driver, "candela@gmail.com", "Candela", "Bobes", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));		
		assertNotNull(PO_View.checkElement(driver, "text", "Ya existe un usuario con ese email."));			
	}
	
	//PR05. Inicio de sesión con datos válidos. /
	@Test
	public void PR05() {
		PO_PrivateView.login(driver, "candela@gmail.com", "12345");		
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));	
		PO_PrivateView.logout(driver);	
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}
	
	//PR06. Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta). /
	@Test
	public void PR06() {
		PO_PrivateView.login(driver, "candela@gmail.com", "falsa");		
		assertNotNull(PO_View.checkElement(driver, "text", "Email o password incorrecto"));			
	}
	
	//PR07. Inicio de sesión con datos inválidos (campo email o contraseña vacíos). /
	@Test
	public void PR07() {
		//Sin contraseña
		PO_PrivateView.login(driver, "candela@gmail.com", "");		
		assertNotNull(PO_View.checkElement(driver, "id", "IdentificacionTitle"));
		SeleniumUtils.textoNoPresentePagina(driver,"Email: ");
		//Sin email
		PO_PrivateView.login(driver, "", "12345");	
		assertNotNull(PO_View.checkElement(driver, "id", "IdentificacionTitle"));
		SeleniumUtils.textoNoPresentePagina(driver,"Email: ");		
	}	
	
	//PR08. Inicio de sesión con datos inválidos (email no existente en la aplicación) /
	@Test
	public void PR08() {
		PO_PrivateView.login(driver, "alguien@gmail.com", "falsa");		
		assertNotNull(PO_View.checkElement(driver, "text", "Email o password incorrecto"));	
		assertNotNull(PO_View.checkElement(driver, "id", "IdentificacionTitle"));
		SeleniumUtils.textoNoPresentePagina(driver,"Email: ");		
	}	
	
	//PR09. Hacer click en la opción de salir de sesión y comprobar que se redirige a la página de inicio de sesión (Login) /
	@Test
	public void PR09() {
		PO_PrivateView.login(driver, "candela@gmail.com", "12345");	
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));
		PO_PrivateView.logout(driver);	
		PO_View.checkElement(driver, "id", "IdentificacionTitle");
		SeleniumUtils.textoNoPresentePagina(driver, "Dinero:");				
	}	
	//PR10. Comprobar que el botón cerrar sesión no está visible si el usuario no está autenticado /
	@Test
	public void PR10() {
		SeleniumUtils.textoNoPresentePagina(driver, "Desconectarse");				
	}	
	
	//PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los que existen en el sistema.  /
	@Test
	public void PR11() {
		
		PO_PrivateView.login(driver, "admin@admin.com", "admin");	
		driver.navigate().to("https://localhost:8081/usuarios");
		
		assertNotNull(PO_View.checkElement(driver, "text", "candela@gmail.com"));
		assertNotNull(PO_View.checkElement(driver, "text", "sergio@gmail.com"));
		assertNotNull(PO_View.checkElement(driver, "text", "admin@admin.com"));
				
	}	
	
	//PR12. Ir a la lista de usuarios, borrar el primer usuario de la lista, comprobar que la lista se
	//actualiza y dicho usuario desaparece. /
	@Test
	public void PR12() {
		
		PO_PrivateView.login(driver, "admin@admin.com", "admin");	
		
		//String firstUser = PO_ListUsersView.getUser1(driver);
		
		//PO_ListUsersView.deleteUser1(driver);
		
		//assertTrue(PO_ListUsersView.getUser1(driver)!=firstUser);
		PO_PrivateView.logout(driver);	
		
		
		PO_PrivateView.signup(driver, "candela@gmail.com", "Candela", "Bobes", "12345", "12345");
		if(SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
			PO_PrivateView.logout(driver);
			PO_PrivateView.signup(driver, "sergio@gmail.com", "Sergio", "Cimadevilla", "12345", "12345");
			if(SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
				PO_PrivateView.logout(driver);
			}
		}
		else {
			PO_PrivateView.signup(driver, "sergio@gmail.com", "Sergio", "Cimadevilla", "12345", "12345");
			if(SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
				PO_PrivateView.logout(driver);
			}
		}
		
		
	}	
	
	//PR13. Ir a la lista de usuarios, borrar el último usuario de la lista, comprobar que la lista se
	//actualiza y dicho usuario desaparece. /
	@Test
	public void PR13() {
//		String email = "test13" + Math.random()*2 +"@gmail.com";
//		PO_PrivateView.signup(driver, email, "Test", "Test", "12345", "12345");
//		PO_PrivateView.logout(driver);
//		
//		PO_PrivateView.login(driver, "admin@admin.com", "admin");	
//		
//		PO_ListUsersView.deleteUserByName(driver, email);
//		SeleniumUtils.textoNoPresentePagina(driver, email);
//		
//		PO_PrivateView.logout(driver);			
	}	
	
	//PR14. Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se actualiza y dichos
	//usuarios desaparecen /
	@Test
	public void PR14() {
		String email = "test14" + Math.random()*2 +"@gmail.com";
		String email2 = "test14" + Math.random()*2 +"@gmail.com";
		String email3 = "test14" + Math.random()*2 +"@gmail.com";
		PO_PrivateView.signup(driver, email, "Test1", "test", "12345", "12345");	
		PO_PrivateView.logout(driver);	
		PO_PrivateView.signup(driver, email2, "Test2", "test", "12345", "12345");	
		PO_PrivateView.logout(driver);	
		PO_PrivateView.signup(driver, email3, "Test3", "test", "12345", "12345");	
		PO_PrivateView.logout(driver);	
		
		String[] users = {email, email2, email3};
		
		PO_PrivateView.login(driver, "admin@admin.com", "admin");
		
		/*
		 * PO_ListUsersView.deleteUsers(driver, users);
		 * 
		 * SeleniumUtils.textoNoPresentePagina(driver, email);
		 * SeleniumUtils.textoNoPresentePagina(driver, email2);
		 * SeleniumUtils.textoNoPresentePagina(driver, email3);
		 */
		PO_PrivateView.logout(driver);				
	}	
	
	//PR15. Ir al formulario de alta de oferta, rellenarla con datos válidos y pulsar el botón Submit.
	//Comprobar que la oferta sale en el listado de ofertas de dicho usuario /
	@Test
	public void PR15() {
		PO_PrivateView.login(driver, "admin@admin.com", "admin");		
		PO_OffersView.addOffer(driver,"cama","para la habitacion",204.0,false);
		assertNotNull(PO_View.checkElement(driver, "text", "cama"));
		assertNotNull(PO_View.checkElement(driver, "text", "para la habitacion"));
		
		PO_PrivateView.logout(driver);			
	}	
	
	//PR16. Ir al formulario de alta de oferta, rellenarla con datos inválidos (campo título vacío y
	//precio en negativo) y pulsar el botón Submit. Comprobar que se muestra el mensaje de campo
	//obligatorio./
	@Test
	public void PR16() {
		PO_PrivateView.login(driver, "admin@admin.com", "admin");	
		PO_OffersView.addOffer(driver,"","Para el baño",100,false);
		assertNotNull(PO_View.checkElement(driver, "id", "mOfertasAgregar"));
		PO_OffersView.addOffer(driver,"silla","de bebe",-7,false);
		assertNotNull(PO_View.checkElement(driver, "text", "Titulo, detalles o precio no validos"));
		PO_PrivateView.logout(driver);			
	}	
	
	//PR017. Mostrar el listado de ofertas para dicho usuario y comprobar que se muestran todas las
	//que existen para este usuario. /
	@Test
	public void PR17() {
		String email = "candela17" + Math.random()*2 +"@gmail.com";
		
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");		
		
		PO_OffersView.addOffer(driver,"Reloj","Para la cocina",10,false);
		PO_OffersView.addOffer(driver,"Manta","Para la habitación",15,false);
		PO_OffersView.addOffer(driver,"Mesita","Para el baño",7,false);
		
		SeleniumUtils.textoPresentePagina(driver, "Reloj");
		SeleniumUtils.textoPresentePagina(driver, "Manta");
		SeleniumUtils.textoPresentePagina(driver, "Mesita");
		
		PO_PrivateView.logout(driver);			
	}	
	
	//PR18. Sin hacer /
	@Test
	public void PR18() {
		assertTrue("PR18 sin hacer", false);			
	}	
	
	//PR19. Sin hacer /
	@Test
	public void PR19() {
		assertTrue("PR19 sin hacer", false);			
	}	
	
	//P20. Sin hacer /
	@Test
	public void PR20() {
		assertTrue("PR20 sin hacer", false);			
	}	
	
	//PR21. Sin hacer /
	@Test
	public void PR21() {
		assertTrue("PR21 sin hacer", false);			
	}	
	
	//PR22. Sin hacer /
	@Test
	public void PR22() {
		assertTrue("PR22 sin hacer", false);			
	}	
	
	//PR23. Sin hacer /
	@Test
	public void PR23() {
		assertTrue("PR23 sin hacer", false);			
	}	
	
	//PR24. Sin hacer /
	@Test
	public void PR24() {
		assertTrue("PR24 sin hacer", false);			
	}	
	//PR25. Sin hacer /
	@Test
	public void PR25() {
		assertTrue("PR25 sin hacer", false);			
	}	
	
	//PR26. Sin hacer /
	@Test
	public void PR26() {
		assertTrue("PR26 sin hacer", false);			
	}	
	
	//PR27. Sin hacer /
	@Test
	public void PR27() {
		assertTrue("PR27 sin hacer", false);			
	}	
	
	//PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);			
	}

	//PR030. Sin hacer /
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", false);			
	}
	
	//PR031. Sin hacer /
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);			
	}
	
		
}

